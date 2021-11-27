use std::env;
use std::str::FromStr;
use regex::Regex;
use actix_web::{HttpRequest, web, HttpResponse};
use chrono::Utc;
use reqwest::Method;
use r2d2_redis::redis::Commands;
use crate::AppData;
use crate::keys::{KEY_COOKIE, KeyData};

pub async fn handler(req: HttpRequest, app_data: web::Data<AppData>) -> HttpResponse {
    let proxy_url = match env::var("PROXY_URL") {
        Ok(i) => i,
        Err(_err) => return HttpResponse::BadRequest().body("no proxy url found in env"),
    };

    let token = match req.headers().get("authorization") {
        Some(i) => match i.to_str() {
            Ok(i) => i.to_string(),
            Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
        },
        None => match req.cookie(KEY_COOKIE) {
            Some(i) => i.to_string(),
            None => return HttpResponse::Unauthorized().body("no api key found in header or cookies"),
        },
    };
    let api_key_vec = token.split("Bearer ").collect::<Vec<&str>>();
    if api_key_vec.len() < 1 {
        return HttpResponse::Unauthorized().body("invalid bearer token provided");
    }
    let key_id = api_key_vec[0].to_string();

    let mut redis_connection = match app_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let key_data_str: String = match (*redis_connection).get(format!("key_*_{}", key_id.to_string())) {
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

    let proxy = match reqwest::Proxy::http(proxy_url.to_string()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let client = match reqwest::Client::builder().proxy(proxy).build() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let method = match Method::from_str(req.method().as_str()) {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let proxied_request = match client.request(method, proxy_url + req.path()).build() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let res = match client.execute(proxied_request).await {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let mut response = HttpResponse::build(res.status());

    let webui_regex = Regex::new(r"^/webui/?$").unwrap();

    if webui_regex.is_match(req.path()) {
        match res.headers().get("x-ipfs-path") {
            Some(i) => return HttpResponse::TemporaryRedirect().insert_header(("location", i)).finish(),
            None => (),
        }
    }
    for (name, val) in res.headers() {
        response.insert_header((name, val.to_owned()));
    }
    let data = match res.bytes().await {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    response.body(data)
}
