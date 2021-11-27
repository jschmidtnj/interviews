use std::env;
use chrono::prelude::{Utc};
use serde::{Serialize, Deserialize};
use validator::{Validate, ValidationErrors};
use actix_web::{put, web, HttpResponse, HttpRequest};
use actix_web::cookie::{Cookie, SameSite};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use chrono::Duration;
use jsonwebtoken::{DecodingKey, encode, decode, EncodingKey, Header, Validation, TokenData};
use r2d2_redis::redis::Commands;
use nanoid::nanoid;
use crate::AppData;
use crate::mode::is_production;
use crate::utils::parse_validation_errors;

#[derive(Serialize, Validate, Deserialize)]
pub struct UserParams {
    #[validate(email)]
    email: String,
    #[validate(length(min = 6))]
    password: String,
}

#[derive(Serialize, Deserialize)]
struct UserData {
    id: String,
    email: String,
    password: String,
}

const AUTH_COOKIE: &str = "token";
const ISSUER: &str = "ipfs-auth";
const AUDIENCE: &str = "ipfs-auth-audience";

fn get_jwt_key() -> Result<String, String> {
    let jwt_secret = match env::var("JWT_SECRET") {
        Ok(i) => i,
        Err(_err) => return Err("cannot find jwt secret".to_string()),
    };
    return Ok(jwt_secret);
}

fn get_user_key(email: String) -> String {
    return format!("user_{}", email);
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JWTClaims {
    pub aud: String,         // Optional. Audience
    pub exp: usize,          // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
    pub iat: usize,          // Optional. Issued at (as UTC timestamp)
    pub iss: String,         // Optional. Issuer
    pub nbf: usize,          // Optional. Not Before (as UTC timestamp)
    pub sub: String,         // Optional. Subject (whom token refers to)
}

pub fn logged_in(request: HttpRequest) -> Option<TokenData<JWTClaims>> {
    let jwt_secret = match get_jwt_key() {
        Ok(i) => i,
        Err(_err) => return None,
    };

    let token = match request.cookie(AUTH_COOKIE) {
        Some(i) => i.value().to_string(),
        None => return None,
    };

    let mut validation = Validation::default();
    validation.set_audience(&[AUDIENCE.to_string()]);
    validation.iss = Some(ISSUER.to_string());

    let data = match decode::<JWTClaims>(&token, &DecodingKey::from_secret(jwt_secret.as_bytes()), &validation) {
        Ok(i) => i,
        Err(_err) => return None,
    };

    return Some(data);
}

#[put("/login")]
pub fn login(user_params: web::Json<UserParams>, app_data: web::Data<AppData>) -> HttpResponse {
    let jwt_secret = match get_jwt_key() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err),
    };

    match user_params.validate() {
        Ok(_) => (),
        Err(err) => {
            let err_obj: ValidationErrors = err;
            return HttpResponse::BadRequest().body(parse_validation_errors(err_obj))
        },
    };

    let mut redis_connection = match app_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let user_key = get_user_key(user_params.email.to_string());
    let user_res: Option<String> = match (*redis_connection).get(user_key.to_string()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let user_id: String;

    if user_res != None {
        let user_data: UserData = match serde_json::from_str(user_res.unwrap().as_str()) {
            Ok(i) => i,
            Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
        };

        let password_hash = match PasswordHash::new(user_data.password.as_str()) {
            Ok(i) => i,
            Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
        };
        match argon2.verify_password(user_params.password.as_bytes(), &password_hash) {
            Ok(_) => (),
            Err(_err) => return HttpResponse::Unauthorized().body("invalid password provided"),
        }
        user_id = user_data.id;
    } else {
        let password_hash = match argon2.hash_password(user_params.password.as_bytes(), &salt) {
            Ok(i) => i,
            Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
        };
        let user = UserData {
            id: nanoid!(),
            email: user_params.email.to_string(),
            password: password_hash.to_string(),
        };
        let user_str = match serde_json::to_string(&user) {
            Ok(i) => i,
            Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
        };
        match (*redis_connection).set(user_key.to_string(), user_str) {
            Ok(i) => i,
            Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
        };
        user_id = user.id;
    }

    let now = Utc::now();
    let claims = JWTClaims {
        aud: AUDIENCE.to_string(),
        exp: (now + Duration::days(1)).timestamp_millis() as usize,
        iat: now.timestamp_millis() as usize,
        iss: ISSUER.to_string(),
        nbf: now.timestamp_millis() as usize,
        sub: user_id.to_string(),
    };

    let token = match encode(&Header::default(), &claims,
                            &EncodingKey::from_secret(jwt_secret.as_ref())) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let production = match is_production() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    HttpResponse::Ok().cookie(
        Cookie::build(AUTH_COOKIE, token)
            .path("/")
            .http_only(true)
            .secure(production).same_site(
            if production { SameSite::Strict } else { SameSite::Lax })
            .finish(),
    ).body(format!("user {} logged in", user_id))
}
