mod proxy;
mod misc;
mod utils;
mod auth;
mod redis;
mod mode;
mod keys;

use actix_cors::Cors;
use actix_web::{App, web, HttpServer};
use dotenv::dotenv;
use std::env;
use crate::redis::RedisPool;

const DEFAULT_PORT: i32 = 8080;

pub struct AppData {
    connection: RedisPool,
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
    let redis_connection = match redis::get_redis_connection() {
        Ok(i) => i,
        Err(err) => panic!("{}", err),
    };
    let address = format!("127.0.0.1:{}", port);
    println!("running at {} 🚀", address);

    HttpServer::new(move || {
        let cors_params = utils::get_cors_params();
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(cors_params.allowed_methods).allowed_headers(cors_params.allowed_headers)
            .max_age(86400);

        let app_data = web::Data::new(AppData {
            connection: redis_connection.clone(),
        });
        App::new().app_data(app_data).wrap(cors).service(auth::login)
            .service(misc::hello).route("/{path:.*}", web::to(proxy::handler))
    })
        .bind(address)?
        .run()
        .await
}
