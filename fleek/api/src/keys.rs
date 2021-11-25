use actix_web::{post, web, HttpResponse};
use validator::{Validate, ValidationErrors};
use serde::{Serialize, Deserialize};
use crate::AppData;
use crate::auth::logged_in;
use crate::utils::parse_validation_errors;

#[derive(Serialize, Validate, Deserialize)]
pub struct KeyParams {
    expires_at: u64,
}

#[post("/keys")]
pub fn add_key(key_params: web::Json<KeyParams>, _app_data: web::Data<AppData>) -> HttpResponse {
    if !logged_in() {
        return HttpResponse::Unauthorized().finish();
    }
    match key_params.validate() {
        Ok(_) => (),
        Err(err) => {
            let err_obj: ValidationErrors = err;
            return HttpResponse::BadRequest().body(parse_validation_errors(err_obj))
        },
    };

    // let mut redis_connection = match app_data.connection.get() {
    //     Ok(i) => i,
    //     Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    // };

    return HttpResponse::Ok().finish();
}
