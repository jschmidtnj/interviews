mod jwt;
mod keys;
mod shared;
pub mod misc;
pub mod mode;
mod cookies;
mod cors;

use worker::*;
use crate::cors::handle_cors;

#[event(fetch)]
pub async fn main(req: Request, env: worker::Env) -> Result<Response> {
    let router = Router::new();

    router
        .options("/", handle_cors)
        .get("/", |_req, _ctx| {
            Response::from_json(&shared::hello::index())
        })
        .options("/hello", handle_cors)
        .get("/hello", |_req, _ctx| {
            Response::from_json(&shared::hello::hello())
        })
        .options("/auth/:username", handle_cors)
        .get_async("/auth/:username", |req, ctx| async move {
            jwt::sign(req, ctx).await
        })
        .options("/verify", handle_cors)
        .get_async("/verify", jwt::verify)
        .options("/README.md", handle_cors)
        .get("/README.md", misc::readme)
        .options("/README.txt", handle_cors)
        .get("/README.txt", misc::readme)
        .options("/stats", handle_cors)
        .get_async("/stats", misc::stats)
        .run(req, env).await
}
