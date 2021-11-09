use serde::{Serialize, Deserialize};
use worker::*;

#[derive(Serialize, Deserialize)]
struct MessageRes {
    message: String,
}

pub fn index(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let message = MessageRes {
        message: "Auth API".to_string(),
    };
    return Response::from_json(&message);
}

pub fn hello(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let message = MessageRes {
        message: "hello world".to_string(),
    };
    return Response::from_json(&message);
}
