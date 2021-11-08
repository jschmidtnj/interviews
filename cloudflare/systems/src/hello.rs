use serde::{ Deserialize, Serialize };
use worker::*;

#[derive(Deserialize, Serialize)]
struct MessageRes {
    message: String,
}

pub fn index(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let message = MessageRes {
        message: String::from("Auth API"),
    };
    return Response::from_json(&message)
}

pub fn hello(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let message = MessageRes {
        message: String::from("hello world"),
    };
    return Response::from_json(&message)
}
