mod proxy;
mod misc;
mod utils;

use actix_cors::Cors;
use actix_web::{App, web, HttpServer};
use dotenv::dotenv;
use std::env;

const DEFAULT_PORT: i32 = 8080;

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
        let cors_params = utils::get_cors_params();
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(cors_params.allowed_methods).allowed_headers(cors_params.allowed_headers)
            .max_age(86400);

        App::new().wrap(cors).service(misc::hello).route("/{path:.*}", web::to(proxy::handler))
    })
        .bind(address)?
        .run()
        .await
}
