use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use chrono::{Utc};
use actix_web::{get, HttpResponse, web, HttpRequest, HttpMessage};
use actix_web::cookie::SameSite;
use actix_web::http::Cookie;
use cloudflare::endpoints::workerskv::read::Read;
use cloudflare::endpoints::workerskv::write_bulk::{KeyValuePair, WriteBulk};
use cloudflare::framework::apiclient::ApiClient;
use instant::Instant;
use jwt_simple::algorithms::RSAKeyPairLike;
use jwt_simple::common::VerificationOptions;
use jwt_simple::prelude::{Claims, Duration, RS256KeyPair, RS256PublicKey, RSAPublicKeyLike};
use nanoid::nanoid;
use crate::mode::{is_production};
use crate::auth::{get_account, get_auth_namespace, get_client};
use crate::keys::get_keys;
use crate::shared::utils::{AUDIENCE, AUTH_COOKIE, ISSUER, NUM_DECODES_KEY, NUM_ENCODES_KEY, SUM_DECODES_KEY, SUM_ENCODES_KEY, Visit, VISIT_PREFIX};


#[derive(Debug, Serialize, Deserialize)]
struct CustomClaims {
    // put custom claims here
}

#[get("/auth/{username}")]
pub async fn sign(web::Path(username): web::Path<String>) -> HttpResponse {
    let instant = Instant::now();
    let now = Utc::now();
    let custom = CustomClaims {};
    let mut audiences = HashSet::new();
    audiences.insert(AUDIENCE.to_string());
    let claims = Claims::with_custom_claims(custom, Duration::from_secs(86400))
        .with_issuer(ISSUER.to_string()).with_audiences(audiences).with_subject(username.to_owned());

    let account = match get_account() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let auth_namespace = match get_auth_namespace() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let keys = match get_keys() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let key_pair = match RS256KeyPair::from_pem(keys.key_pair.as_str()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let token = match key_pair.sign(claims) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let production = match is_production() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let client = match get_client() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let num_encode = match client.request_text(&Read {
        key: NUM_ENCODES_KEY,
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result.parse::<u64>().unwrap(),
        Err(_err) => 0,
    };

    let sum_encode = match client.request_text(&Read {
        key: SUM_ENCODES_KEY,
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result.parse::<u64>().unwrap(),
        Err(_err) => 0,
    };

    let encoding_time = Instant::now() - instant;

    let visit = Visit {
        time: now.timestamp() as usize,
        user: username.to_owned(),
    };

    match client.request(&WriteBulk {
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
        bulk_key_value_pairs: vec![KeyValuePair {
            key: NUM_ENCODES_KEY.to_string(),
            value: (num_encode + 1).to_string(),
            base64: None,
            expiration: None,
            expiration_ttl: None,
        }, KeyValuePair {
            key: SUM_ENCODES_KEY.to_string(),
            value: (sum_encode + (encoding_time.as_millis() as u64)).to_string(),
            base64: None,
            expiration: None,
            expiration_ttl: None,
        }, KeyValuePair {
            key: (VISIT_PREFIX.to_owned() + nanoid!().as_str()),
            value: serde_json::to_string(&visit).unwrap(),
            base64: None,
            expiration: None,
            expiration_ttl: None,
        }],
    }) {
        Ok(_) => (),
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    HttpResponse::Ok().cookie(
        Cookie::build(AUTH_COOKIE, token)
            .path("/")
            .secure(production).same_site(
            if production { SameSite::Strict } else { SameSite::Lax })
            .finish(),
    ).body(keys.public_key)
}

#[get("/verify")]
pub async fn verify(req: HttpRequest) -> HttpResponse {
    let cookies = match req.cookies() {
        Ok(i) => i,
        Err(err) => return HttpResponse::Unauthorized().body(err.to_string()),
    };
    println!("{}", cookies.len());
    let token = match req.cookie(AUTH_COOKIE) {
        Some(i) => i.value().to_string(),
        None => return HttpResponse::Unauthorized().body("cannot find auth token"),
    };

    let instant = Instant::now();
    let now = Utc::now();

    let account = match get_account() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let auth_namespace = match get_auth_namespace() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let client = match get_client() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let keys = match get_keys() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let public_key = match RS256PublicKey::from_pem(keys.public_key.as_str()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let mut verification_options = VerificationOptions::default();
    let mut issuers = HashSet::new();
    issuers.insert(ISSUER.to_string());
    verification_options.allowed_issuers = Some(issuers);
    let mut audiences = HashSet::new();
    audiences.insert(AUDIENCE.to_string());
    verification_options.allowed_audiences = Some(audiences);

    let token_data = match public_key.verify_token::<CustomClaims>(&token, Some(verification_options)) {
        Ok(i) => i,
        Err(err) => return HttpResponse::Unauthorized().body(err.to_string()),
    };

    let username = token_data.subject.unwrap();

    let num_decode = match client.request_text(&Read {
        key: NUM_DECODES_KEY,
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result.parse::<u64>().unwrap(),
        Err(_err) => 0,
    };

    let sum_decode = match client.request_text(&Read {
        key: SUM_DECODES_KEY,
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result.parse::<u64>().unwrap(),
        Err(_err) => 0,
    };

    let decoding_time = Instant::now() - instant;

    let visit = Visit {
        time: now.timestamp() as usize,
        user: username.to_owned(),
    };

    match client.request(&WriteBulk {
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
        bulk_key_value_pairs: vec![KeyValuePair {
            key: NUM_DECODES_KEY.to_string(),
            value: (num_decode + 1).to_string(),
            base64: None,
            expiration: None,
            expiration_ttl: None,
        }, KeyValuePair {
            key: SUM_DECODES_KEY.to_string(),
            value: (sum_decode + (decoding_time.as_millis() as u64)).to_string(),
            base64: None,
            expiration: None,
            expiration_ttl: None,
        }, KeyValuePair {
            key: (VISIT_PREFIX.to_owned() + nanoid!().as_str()),
            value: serde_json::to_string(&visit).unwrap(),
            base64: None,
            expiration: None,
            expiration_ttl: None,
        }],
    }) {
        Ok(_) => (),
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    HttpResponse::Ok().body(username)
}
