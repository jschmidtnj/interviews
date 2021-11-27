use std::collections::HashMap;
use actix_web::{post, get, delete, web, HttpResponse, HttpRequest};
use actix_web::cookie::{Cookie, SameSite};
use chrono::Utc;
use nanoid::nanoid;
use r2d2_redis::redis::Commands;
use validator::{Validate, ValidationErrors};
use serde::{Serialize, Deserialize};
use serde_json::to_string;
use crate::AppData;
use crate::auth::logged_in;
use crate::mode::is_production;
use crate::utils::parse_validation_errors;

pub const KEY_COOKIE: &str = "auth_key";

#[derive(Serialize, Validate, Deserialize)]
pub struct NewKeyParams {
    expires_at: u64,
}

#[derive(Serialize, Deserialize)]
pub struct KeyData {
    pub expires_at: u64,
}

fn get_key_base(user_id: String) -> String {
    return format!("key_{}", user_id);
}

// TODO - hash key here with argon. only save hashed key
pub fn get_key_key(user_id: String, key_id: String) -> String {
    return format!("{}_{}", get_key_base(user_id), key_id);
}

#[post("/keys")]
pub fn add_key(req: HttpRequest, key_params: web::Json<NewKeyParams>, app_data: web::Data<AppData>) -> HttpResponse {
    match key_params.validate() {
        Ok(_) => (),
        Err(err) => {
            let err_obj: ValidationErrors = err;
            return HttpResponse::BadRequest().body(parse_validation_errors(err_obj))
        },
    };

    let now = Utc::now();
    if key_params.expires_at <= now.timestamp_millis() as u64 {
        return HttpResponse::BadRequest().body("invalid expiration time")
    }

    let user_id = match logged_in(req) {
        Some(i) => i.claims.sub,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let key_data = KeyData {
        expires_at: key_params.expires_at,
    };
    let key_data_str = match to_string(&key_data) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let mut redis_connection = match app_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    match (*redis_connection).set(get_key_key(user_id, nanoid!()), key_data_str) {
        Ok(()) => (),
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    return HttpResponse::Ok().finish();
}

#[derive(Serialize, Deserialize)]
pub struct ListKeysData {
    keys: HashMap<String, KeyData>,
}

#[get("/keys")]
pub fn get_keys(req: HttpRequest, app_data: web::Data<AppData>) -> HttpResponse {
    let user_id = match logged_in(req) {
        Some(i) => i.claims.sub,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let mut redis_connection = match app_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let keys: Vec<String> = match (*redis_connection).keys(get_key_base(user_id) + "_*") {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let mut res = ListKeysData {
        keys: HashMap::new(),
    };

    for key in keys {
        let key_data_str: String = match (*redis_connection).get(key.to_string()) {
            Ok(i) => i,
            Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
        };
        let key_data: KeyData = match serde_json::from_str(key_data_str.as_str()) {
            Ok(i) => i,
            Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
        };
        res.keys.insert(key, key_data);
    }

    return HttpResponse::Ok().json(res);
}

#[derive(Serialize, Deserialize)]
pub struct KeyRes {
    id: String,
    data: KeyData,
}

#[get("/keys/{key_id}")]
pub fn get_key(req: HttpRequest, params: web::Path<String>, app_data: web::Data<AppData>) -> HttpResponse {
    let user_id = match logged_in(req) {
        Some(i) => i.claims.sub,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let mut redis_connection = match app_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let key_id = params.into_inner();

    let key_data_str: String = match (*redis_connection).get(get_key_key(user_id, key_id.to_string())) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let key_data: KeyData = match serde_json::from_str(key_data_str.as_str()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let res = KeyRes {
        id: key_id,
        data: key_data,
    };

    return HttpResponse::Ok().json(res);
}

#[delete("/keys/{key_id}")]
pub fn deactivate_key(req: HttpRequest, params: web::Path<String>, app_data: web::Data<AppData>) -> HttpResponse {
    let user_id = match logged_in(req) {
        Some(i) => i.claims.sub,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let mut redis_connection = match app_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let key_id = params.into_inner();
    let full_key_id = get_key_key(user_id, key_id.to_string());

    let key_data_str: String = match (*redis_connection).get(full_key_id.to_string()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let mut key_data: KeyData = match serde_json::from_str(key_data_str.as_str()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let now = Utc::now();
    key_data.expires_at = now.timestamp_millis() as u64;

    let key_data_str = match to_string(&key_data) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    match (*redis_connection).set(full_key_id, key_data_str) {
        Ok(()) => (),
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let res = KeyRes {
        id: key_id,
        data: key_data,
    };

    return HttpResponse::Ok().json(res);
}

#[get("/keys/{key_id}/use")]
pub fn use_key(req: HttpRequest, params: web::Path<String>, app_data: web::Data<AppData>) -> HttpResponse {
    let user_id = match logged_in(req) {
        Some(i) => i.claims.sub,
        None => return HttpResponse::Unauthorized().finish(),
    };

    let mut redis_connection = match app_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let key_id = params.into_inner();

    let key_data_str: String = match (*redis_connection).get(get_key_key(user_id, key_id.to_string())) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let key_data: KeyData = match serde_json::from_str(key_data_str.as_str()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let now = Utc::now();
    if key_data.expires_at < now.timestamp_millis() as u64 {
        return HttpResponse::Unauthorized().body("api key expired");
    }

    let res = KeyRes {
        id: key_id.to_string(),
        data: key_data,
    };

    let production = match is_production() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    return HttpResponse::Ok().cookie(
        Cookie::build(KEY_COOKIE, key_id)
            .path("/")
            .http_only(true)
            .secure(production).same_site(
            if production { SameSite::Strict } else { SameSite::Lax })
            .finish(),
    ).json(res);
}
