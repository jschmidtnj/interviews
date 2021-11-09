mod hello;
mod jwt;
mod keys;
mod utils;
mod mode;
mod misc;

use worker::*;

#[event(fetch)]
pub async fn main(req: Request, env: worker::Env) -> Result<Response> {
    let router = Router::new();

    router
        .get("/", hello::index)
        .get("/hello", hello::hello)
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
