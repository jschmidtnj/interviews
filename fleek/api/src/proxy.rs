use std::str::FromStr;
use regex::Regex;
use actix_web::{HttpRequest, HttpResponse};
use reqwest::Method;

const PROXIED_URL: &str = "http://localhost:5001";

pub async fn handler(req: HttpRequest) -> HttpResponse {
    // do authentication with redis kv store

    let proxy = match reqwest::Proxy::http(PROXIED_URL.to_string()) {
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
    let proxied_request = match client.request(method, PROXIED_URL.to_string() + req.path()).build() {
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
