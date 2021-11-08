use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use chrono::{Utc, Duration};
use http::StatusCode;
use worker::*;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    aud: String, // Optional. Audience
    exp: usize, // Required (validate_exp defaults to true in validation). Expiration time (as UTC timestamp)
    iat: usize, // Optional. Issued at (as UTC timestamp)
    iss: String, // Optional. Issuer
    nbf: usize, // Optional. Not Before (as UTC timestamp)
    sub: String, // Optional. Subject (whom token refers to)
}

const issuer: String = String::from("Postit Monster");

pub fn sign(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let username = ctx.param("username");
    if let None = username {
        return Response::error("cannot get exp", StatusCode::BAD_REQUEST.as_u16());
    }
    let now = Utc::now();
    let exp = now.checked_add_signed(Duration::days(1));
    if let None = exp {
        return Response::error("cannot get exp", StatusCode::INTERNAL_SERVER_ERROR.as_u16());
    }
    let claims = Claims {
        aud: String::from("postit-users"),
        exp: exp.unwrap().timestamp() as usize,
        iat: now.timestamp() as usize,
        iss: issuer,
        nbf: now.timestamp() as usize,
        sub: *username.unwrap(),
    };
    // EncodingKey::from_rsa_pem(key: &[u8])
    // let token = encode(
    //     &Header::new(Algorithm::RS256),
    //     &claims,
    //     &EncodingKey::from_rsa_pem(include_bytes!("privkey.pem"))?,
    // )?;

    return Response::ok("test");
}
