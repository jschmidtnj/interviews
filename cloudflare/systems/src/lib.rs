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
        .get_async("/auth/:username", jwt::sign)
        .get_async("/verify", jwt::verify)
        .get("/README.txt", misc::readme)
        .get_async("/stats", misc::stats)
        .run(req, env).await
}
