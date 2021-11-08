use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use cookie::{Cookie, SameSite};
use http::StatusCode;
use worker::*;
use crate::keys::get_keys;
use crate::utils::{get_cookies, is_production};

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

const ISSUER: String = String::from("Postit Monster");

pub fn sign(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let username = match ctx.param("username") {
        Some(i) => String::from(i.as_str()),
        None => return Response::error("cannot get exp", StatusCode::BAD_REQUEST.as_u16()),
    };

    let now = Utc::now();
    let exp = match now.checked_add_signed(Duration::days(1)) {
        Some(i) => i,
        None => return Response::error("cannot get exp", StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let claims = Claims {
        aud: String::from("postit-users"),
        exp: exp.unwrap().timestamp() as usize,
        iat: now.timestamp() as usize,
        iss: ISSUER,
        nbf: now.timestamp() as usize,
        sub: username,
    };

    let keys = match get_keys(*ctx) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let private_key = match keys.privateKey.private_key_to_pem() {
        Ok(i) => i.as_slice(),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let encoding_key = match EncodingKey::from_rsa_pem(private_key) {
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

    let public_key = match keys.publicKey.public_key_to_pem() {
        Ok(i) => match String::from_utf8(i) {
            Ok(i) => i,
            Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let production = match is_production() {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    Response::ok(public_key).map(|res| {
        let mut headers = Headers::new();
        let cookie = Cookie::build("token", token)
            .path("*").secure(production).same_site(if production { SameSite::Strict } else { SameSite::Lax }).finish();
        headers.set("Set-Cookie", cookie.to_string().as_str());
        res.with_headers(headers)
    })
}

pub fn verify(req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let cookies = match get_cookies(req) {
        Ok(i) => i,
        Err(err) => return Response::error(err, StatusCode::UNAUTHORIZED.as_u16()),
    };
    Response::ok("asdf123")
}
