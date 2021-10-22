extern crate actix_web;
extern crate dotenv;
#[macro_use]
extern crate simple_error;

use std::error::Error;
use dotenv::dotenv;
use std::env;
use std::ffi::IntoStringError;
use std::num::ParseIntError;
use actix_web::{web, App, HttpRequest, HttpServer, Responder};

async fn greet(req: HttpRequest) -> impl Responder {
    let name = req.match_info().get("name").unwrap_or("World");
    format!("Hello {}!", &name)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    const portKey: &str = "PORT";
    let port;
    match env::var(portKey) {
        Ok(val) => match val.parse::<u16>() {
            Ok(n) => port = n,
            Err(e) => bail!(format!("couldn't parse {}: {}", val, e)),
        },
        Err(e) => bail!(format!("couldn't get var for key {}: {}", portKey, e)),
    }

    // convert string to int
    // try using Result instead of panic!
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(greet))
            .route("/{name}", web::get().to(greet))
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await
}
