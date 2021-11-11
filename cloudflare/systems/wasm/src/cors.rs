use http::StatusCode;
use worker::*;
use crate::shared::utils::get_cors_params;

pub fn handle_cors(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let public_url = match ctx.var("PUBLIC_URL") {
        Ok(i) => i.to_string(),
        Err(_i) => return Response::error("cannot get public url".to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let api_url = match ctx.var("API_URL") {
        Ok(i) => i.to_string(),
        Err(_i) => return Response::error("cannot get api url".to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let worker_url = match ctx.var("WORKER_URL") {
        Ok(i) => i.to_string(),
        Err(_i) => return Response::error("cannot get worker url".to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };

    let allowed_origins = vec![public_url, api_url, worker_url];

    let cors_params = get_cors_params();

    let mut headers = Headers::new();
    match headers.set("access-control-allow-methods", cors_params.allowed_methods.iter().map(|i| -> String {
        i.to_string()
    }).collect::<Vec<String>>().join(", ").as_str()) {
        Ok(_) => (),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }
    match headers.set("access-control-allow-headers", cors_params.allowed_headers.iter().map(|i| -> String {
        i.to_string()
    }).collect::<Vec<String>>().join(", ").as_str()) {
        Ok(_) => (),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }
    match headers.set("access-control-allow-credentials", "true") {
        Ok(_) => (),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }
    match headers.set("access-control-max-age", "86400") {
        Ok(_) => (),
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }
    match req.headers().get("origin") {
        Ok(i) => match i {
            Some(origin) => {
                if allowed_origins.contains(&origin) {
                    match headers.set("access-control-allow-origin", origin.as_str()) {
                        Ok(_) => (),
                        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
                    }
                }
            }
            None => (),
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    Response::empty().map(|res| {
        res.with_headers(headers)
    })
}