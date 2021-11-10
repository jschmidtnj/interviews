mod shared;
mod auth;
mod misc;
mod jwt;
mod keys;
mod mode;

use actix_web::{get, App, HttpServer, HttpResponse};
use dotenv::dotenv;
use std::env;
use crate::jwt::{sign, verify};
use crate::misc::{readme, readme_txt, stats};

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

    HttpServer::new(|| App::new().service(hello).service(readme_txt)
        .service(readme).service(stats).service(sign).service(verify))
        .bind(address)?
        .run()
        .await
}
