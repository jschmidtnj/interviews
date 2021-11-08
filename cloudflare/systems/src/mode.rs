use std::error::Error;

const PRODUCTION_MODE: &str = "production";

pub fn is_production(ctx: &worker::RouteContext<()>) -> Result<bool, String> {
    let private_key_str = match ctx.secret("PRIVATE_KEY") {
        Ok(i) => i.to_string(),
        Err(err) => return Err(err.to_string()),
    };
    Ok(private_key_str == PRODUCTION_MODE)
}
