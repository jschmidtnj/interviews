use std::time::Instant;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use cookie::{Cookie, SameSite};
use http::StatusCode;
use jsonwebtoken::errors::ErrorKind;
use worker::*;
use nanoid::nanoid;
use crate::keys::get_keys;
use crate::utils::{AUTH_KV, get_cookies, NUM_DECODES_KEY, NUM_ENCODES_KEY, SUM_DECODES_KEY, SUM_ENCODES_KEY, Visit, VISIT_PREFIX};
use crate::mode::{is_production};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    aud: String,
    // Optional. Audience
    exp: usize,
    // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
    iat: usize,
    // Optional. Issued at (as UTC timestamp)
    iss: String,
    // Optional. Issuer
    nbf: usize,
    // Optional. Not Before (as UTC timestamp)
    sub: String, // Optional. Subject (whom token refers to)
}

const ISSUER: &str = "PostIt Monster";
const AUTH_COOKIE: &str = "token";

pub async fn sign(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let username = match ctx.param("username") {
        Some(i) => i.as_str().to_string(),
        None => return Response::error("cannot get exp", StatusCode::BAD_REQUEST.as_u16()),
    };

    let instant = Instant::now();
    let now = Utc::now();
    let exp = match now.checked_add_signed(Duration::days(1)) {
        Some(i) => i,
        None => return Response::error("cannot get exp", StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let claims = Claims {
        aud: "post-it-users".to_string(),
        exp: exp.timestamp() as usize,
        iat: now.timestamp() as usize,
        iss: ISSUER.to_string(),
        nbf: now.timestamp() as usize,
        sub: username.to_owned(),
    };

    let keys = match get_keys(&ctx) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let encoding_key = match EncodingKey::from_rsa_pem(keys.private_key.as_bytes()) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let token = match encode(
        &Header::new(Algorithm::RS256),
        &claims,
        &encoding_key,
    ) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let encoding_time = instant.elapsed();

    let production = match is_production(&ctx) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let auth = match ctx.kv(AUTH_KV) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let num_encode = match auth.get(NUM_ENCODES_KEY).await {
        Ok(i) => i.unwrap().as_string().parse::<u64>().unwrap(),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    match auth.put(NUM_ENCODES_KEY, num_encode + 1) {
        Ok(i) => match i.execute().await {
            Ok(_) => (),
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let sum_encode = match auth.get(SUM_ENCODES_KEY).await {
        Ok(i) => i.unwrap().as_string().parse::<u64>().unwrap(),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    match auth.put(SUM_ENCODES_KEY, sum_encode + (encoding_time.as_millis() as u64)) {
        Ok(i) => match i.execute().await {
            Ok(_) => (),
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let visit = Visit {
        time: now.timestamp() as usize,
        user: username.to_owned(),
    };
    match auth.put((VISIT_PREFIX.to_owned() + nanoid!().as_str()).as_str(), serde_json::to_string(&visit).unwrap()) {
        Ok(i) => match i.execute().await {
            Ok(_) => (),
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    Response::ok(keys.public_key).map(|res| {
        let mut headers = Headers::new();
        let cookie = Cookie::build(AUTH_COOKIE, token)
            .path("*").secure(production).same_site(if production { SameSite::Strict } else { SameSite::Lax }).finish();
        headers.set("Set-Cookie", cookie.to_string().as_str());
        res.with_headers(headers)
    })
}

pub async fn verify(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let cookies = match get_cookies(req) {
        Ok(i) => i,
        Err(err) => return Response::error(err, StatusCode::UNAUTHORIZED.as_u16()),
    };
    let token = match cookies.get(AUTH_COOKIE) {
        Some(i) => i.value().to_string(),
        None => return Response::error("no auth token found", StatusCode::UNAUTHORIZED.as_u16()),
    };

    let instant = Instant::now();
    let now = Utc::now();

    let keys = match get_keys(&ctx) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let decoding_key = match DecodingKey::from_rsa_pem(keys.public_key.as_bytes()) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let validation = Validation { iss: Some(ISSUER.to_string()), algorithms: vec![Algorithm::RS256], ..Validation::default() };
    let token_data = match decode::<Claims>(&token, &decoding_key, &validation) {
        Ok(i) => i,
        Err(err) => return Response::error(match *err.kind() {
            ErrorKind::InvalidToken => "invalid token",
            ErrorKind::InvalidIssuer => "invalid jwt issuer",
            _ => "invalid jwt",
        }, StatusCode::UNAUTHORIZED.as_u16()),
    };
    let decoding_time = instant.elapsed();

    // let username = token_data.claims.sub;
    let username = String::from("asdf123");

    let auth = match ctx.kv(AUTH_KV) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let num_encode = match auth.get(NUM_DECODES_KEY).await {
        Ok(i) => i.unwrap().as_string().parse::<u64>().unwrap(),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    match auth.put(NUM_DECODES_KEY, num_encode + 1) {
        Ok(i) => match i.execute().await {
            Ok(_) => (),
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let sum_encode = match auth.get(SUM_DECODES_KEY).await {
        Ok(i) => i.unwrap().as_string().parse::<u64>().unwrap(),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    match auth.put(SUM_DECODES_KEY, sum_encode + (decoding_time.as_millis() as u64)) {
        Ok(i) => match i.execute().await {
            Ok(_) => (),
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let visit = Visit {
        time: now.timestamp() as usize,
        user: username.to_owned(),
    };
    match auth.put((String::from(VISIT_PREFIX) + nanoid!().as_str()).as_str(), serde_json::to_string(&visit).unwrap()) {
        Ok(i) => match i.execute().await {
            Ok(_) => (),
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    Response::ok(username)
}
