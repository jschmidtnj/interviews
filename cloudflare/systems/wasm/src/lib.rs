mod jwt;
mod keys;
mod shared;
pub mod misc;
pub mod mode;
mod cookies;

use worker::*;

#[event(fetch)]
pub async fn main(req: Request, env: worker::Env) -> Result<Response> {
    let router = Router::new();

    router
        .get("/", |_req, _ctx| {
            Response::from_json(&shared::hello::index())
        })
        .get("/hello", |_req, _ctx| {
            Response::from_json(&shared::hello::hello())
        })
        .get_async("/auth/:username", |req, ctx| async move {
            jwt::sign(req, ctx).await
        })
        .get_async("/verify", jwt::verify)
        .get("/README.txt", misc::readme)
        .get_async("/stats", misc::stats)
        .get_async("/echo-bytes", |mut req, _ctx| async move {
            let data = req.bytes().await?;
            if data.len() < 1024 {
                return Response::error("Bad Request", 400);
            }

            Response::from_bytes(data)
        })
        .run(req, env).await
}
