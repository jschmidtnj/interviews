use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use chrono::{Utc};
use cookie::{Cookie, SameSite};
use http::StatusCode;
use instant::Instant;
use jwt_simple::algorithms::RSAKeyPairLike;
use jwt_simple::common::VerificationOptions;
use jwt_simple::prelude::{Claims, Duration, RS256KeyPair, RS256PublicKey, RSAPublicKeyLike};
use worker::*;
use nanoid::nanoid;
use crate::cookies::get_cookies;
use crate::keys::get_keys;
use crate::shared::utils::{AUDIENCE, ISSUER, AUTH_COOKIE, AUTH_KV, NUM_DECODES_KEY, NUM_ENCODES_KEY, SUM_DECODES_KEY, SUM_ENCODES_KEY, Visit, VISIT_PREFIX, USER_PREFIX};
use crate::mode::{is_production};


#[derive(Debug, Serialize, Deserialize)]
struct CustomClaims {
    // put custom claims here
}

pub async fn sign(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let username = match ctx.param("username") {
        Some(i) => i.as_str().to_string(),
        None => return Response::error("cannot get exp", StatusCode::BAD_REQUEST.as_u16()),
    };

    let auth = match ctx.kv(AUTH_KV) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    match auth.get((USER_PREFIX.to_owned() + username.as_str()).as_str()).await {
        Ok(i) => match i {
            Some(_) => return Response::error(format!("username \"{}\" already registered", username), StatusCode::UNAUTHORIZED.as_u16()),
            None => (),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let instant = Instant::now();
    let now = Utc::now();
    let custom = CustomClaims {};
    let mut audiences = HashSet::new();
    audiences.insert(AUDIENCE.to_string());
    let claims = Claims::with_custom_claims(custom, Duration::from_secs(86400))
        .with_issuer(ISSUER.to_string()).with_audiences(audiences).with_subject(username.to_owned());

    let keys = match get_keys(&ctx) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let key_pair = match RS256KeyPair::from_pem(keys.key_pair.as_str()) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string() + keys.key_pair.as_str(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let token = match key_pair.sign(claims) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let production = match is_production(&ctx) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let num_encode = match auth.get(NUM_ENCODES_KEY).await {
        Ok(i) => match i {
            Some(i) => i.as_string().parse::<u64>().unwrap(),
            None => 0,
        },
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
        Ok(i) => match i {
            Some(i) => i.as_string().parse::<u64>().unwrap(),
            None => 0,
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let encoding_time = Instant::now() - instant;

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

    match auth.put((USER_PREFIX.to_owned() + username.as_str()).as_str(), serde_json::to_string(&visit).unwrap()) {
        Ok(i) => match i.execute().await {
            Ok(_) => (),
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    Response::ok(keys.public_key).map(|res| {
        let mut headers = Headers::new();
        let cookie = Cookie::build(AUTH_COOKIE, token).http_only(true)
            .path("/").secure(production).same_site(if production { SameSite::Strict } else { SameSite::Lax }).finish();
        headers.set("Set-Cookie", cookie.to_string().as_str()).unwrap();
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
    let public_key = match RS256PublicKey::from_pem(keys.public_key.as_str()) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
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
        Err(err) => return Response::error(err.to_string(), StatusCode::UNAUTHORIZED.as_u16()),
    };

    let username = token_data.subject.unwrap();

    let auth = match ctx.kv(AUTH_KV) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let num_decode = match auth.get(NUM_DECODES_KEY).await {
        Ok(i) => match i {
            Some(i) => i.as_string().parse::<u64>().unwrap(),
            None => 0,
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    match auth.put(NUM_DECODES_KEY, num_decode + 1) {
        Ok(i) => match i.execute().await {
            Ok(_) => (),
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let sum_decode = match auth.get(SUM_DECODES_KEY).await {
        Ok(i) => match i {
            Some(i) => i.as_string().parse::<u64>().unwrap(),
            None => 0,
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let decoding_time = Instant::now() - instant;

    match auth.put(SUM_DECODES_KEY, sum_decode + (decoding_time.as_millis() as u64)) {
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
