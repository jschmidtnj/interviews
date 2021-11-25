use serde::{Serialize, Deserialize};
use actix_web::{get, HttpResponse};

#[derive(Serialize, Deserialize)]
pub struct MessageRes {
    message: String,
}

#[get("/hello")]
pub fn hello() -> HttpResponse {
    let message = MessageRes {
        message: "hello world".to_string(),
    };
    HttpResponse::Ok().json(message)
}
