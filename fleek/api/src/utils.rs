use http::Method;
use http::header::{CACHE_CONTROL, CONTENT_TYPE, ORIGIN, REFERER};
use validator::ValidationErrors;

pub struct CorsParams {
    pub allowed_methods: Vec::<Method>,
    pub allowed_headers: Vec::<String>,
}

pub fn get_cors_params() -> CorsParams {
    CorsParams {
        allowed_methods: vec![Method::GET],
        allowed_headers: vec![REFERER.to_string(), ORIGIN.to_string(),
                              CONTENT_TYPE.to_string(), CACHE_CONTROL.to_string(),
                              "sentry-trace".to_string()],
    }
}

// TODO - convert to a good error message in util
pub fn parse_validation_errors(err: ValidationErrors) -> String {
    return err.to_string();
}
