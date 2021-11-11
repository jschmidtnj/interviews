mod shared;
mod auth;
mod misc;
mod jwt;
mod keys;
mod mode;

use actix_cors::Cors;
use actix_web::{get, App, HttpServer, HttpResponse};
use dotenv::dotenv;
use std::env;
use crate::jwt::{sign, verify};
use crate::misc::{readme, readme_txt, stats};
use crate::shared::utils::get_cors_params;

const DEFAULT_PORT: i32 = 8080;

#[get("/")]
fn index() -> HttpResponse {
    HttpResponse::Ok().json(shared::hello::index())
}

#[get("/hello")]
fn hello() -> HttpResponse {
    HttpResponse::Ok().json(shared::hello::hello())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let port_str = match env::var("PORT") {
        Ok(i) => i,
        Err(_err) => DEFAULT_PORT.to_string(),
    };
    let port = match port_str.parse::<i32>() {
        Ok(i) => i,
        Err(_err) => DEFAULT_PORT,
    };
    let address = format!("127.0.0.1:{}", port);
    println!("running at {} 🚀", address);

    HttpServer::new(|| {
        let public_url = match env::var("PUBLIC_URL") {
            Ok(i) => i,
            Err(_err) => panic!("cannot find public url in env"),
        };
        let api_url = match env::var("API_URL") {
            Ok(i) => i,
            Err(_err) => panic!("cannot find api url in env"),
        };
        let worker_url = match env::var("WORKER_URL") {
            Ok(i) => i,
            Err(_err) => panic!("cannot find worker url in env"),
        };
        let allowed_origins = vec![public_url, api_url, worker_url];
        let cors_params = get_cors_params();

        let cors = Cors::default()
            .allowed_origin_fn(move |origin, _req_header| {
                allowed_origins.contains(&match origin.to_str() {
                    Ok(i) => i.to_string(),
                    Err(err) => panic!("{}", err.to_string()),
                })
            }).allowed_methods(cors_params.allowed_methods).allowed_headers(cors_params.allowed_headers)
            .max_age(86400);

        App::new().wrap(cors).service(hello).service(readme_txt)
            .service(readme).service(stats).service(sign).service(verify)
    })
        .bind(address)?
        .run()
        .await
}
