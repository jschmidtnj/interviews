use serde::{Serialize, Deserialize};
use validator::{Validate, ValidationError, ValidationErrors};
use actix_web::{put, web, HttpResponse};
use r2d2_redis::redis::Commands;
use crate::AppData;

#[derive(Serialize, Validate, Deserialize)]
pub struct UserParams {
    #[validate(email, custom = "check_unique_email")]
    email: String,
    #[validate(length(min = 6))]
    password: String,
}

fn check_unique_email(_email: &str) -> Result<(), ValidationError> {
    Ok(())
}

#[put("/login")]
pub fn login(user_params: web::Json<UserParams>, redis_data: web::Data<AppData>) -> HttpResponse {
    match user_params.validate() {
        Ok(_) => (),
        Err(err) => {
            // TODO - convert to a good error message in util
            let err_obj: ValidationErrors = err;
            return HttpResponse::BadRequest().body(err_obj.to_string())
        },
    };

    let mut redis_connection = match redis_data.connection.get() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let raw_res: Option<String> = match (*redis_connection).get("hello") {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let res = match raw_res {
        Some(i) => i,
        None => return HttpResponse::InternalServerError().body("no key found".to_string()),
    };
    HttpResponse::Ok().body(res)
}
