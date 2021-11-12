use http::header::{ACCESS_CONTROL_ALLOW_CREDENTIALS, ACCESS_CONTROL_ALLOW_HEADERS, ACCESS_CONTROL_ALLOW_METHODS, ACCESS_CONTROL_ALLOW_ORIGIN, ACCESS_CONTROL_MAX_AGE};
use http::StatusCode;
use worker::*;
use crate::mode::is_production;
use crate::shared::utils::get_cors_params;

pub fn handle_cors(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let cors_params = get_cors_params();

    let mut headers = Headers::new();
    match headers.set(ACCESS_CONTROL_ALLOW_METHODS.as_str(), cors_params.allowed_methods.iter().map(|i| -> String {
        i.to_string()
    }).collect::<Vec<String>>().join(", ").as_str()) {
        Ok(_) => (),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }
    match headers.set(ACCESS_CONTROL_ALLOW_HEADERS.as_str(), cors_params.allowed_headers.iter().map(|i| -> String {
        i.to_string()
    }).collect::<Vec<String>>().join(", ").as_str()) {
        Ok(_) => (),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }
    match headers.set(ACCESS_CONTROL_ALLOW_CREDENTIALS.as_str(), "true") {
        Ok(_) => (),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }
    match headers.set(ACCESS_CONTROL_MAX_AGE.as_str(), "86400") {
        Ok(_) => (),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }
    match req.headers().get("origin") {
        Ok(i) => match i {
            Some(origin) => {
                let production = match is_production(&ctx) {
                    Ok(i) => i,
                    Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
                };
                let curr_origin = if production { origin } else { "http://localhost".to_string() };
                match headers.set(ACCESS_CONTROL_ALLOW_ORIGIN.as_str(), curr_origin.as_str()) {
                    Ok(_) => (),
                    Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
                }
            }
            None => return Response::error("cannot find origin".to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    Response::empty().map(|res| {
        res.with_headers(headers).with_status(StatusCode::NO_CONTENT.as_u16())
    })
}