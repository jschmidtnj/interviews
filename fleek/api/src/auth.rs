use serde::{Serialize, Deserialize};
use validator::{Validate, ValidationError};
use actix_web::{put, web, HttpResponse};
use r2d2_redis::redis::Commands;
use crate::AppData;

#[derive(Serialize, Validate, Deserialize)]
pub struct UserParams {
    #[validate(email, custom = "check_unique_email")]
    username: String,
    #[validate(length(min = 6))]
    password: String,
}

fn check_unique_email(_email: &str) -> Result<(), ValidationError> {
    Ok(())
}

#[put("/login")]
pub fn login(_user_params: web::Json<UserParams>, redis_data: web::Data<AppData>) -> HttpResponse {
    let mut redis_connection = match redis_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let res: String = match (*redis_connection).get("hello") {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    HttpResponse::Ok().body(res)
}
