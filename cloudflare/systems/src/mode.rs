use std::error::Error;

const PRODUCTION_MODE: String = String::from("production");

pub fn is_production(ctx: &worker::RouteContext<()>) -> Result<bool, &str> {
    let private_key_str = match ctx.secret("PRIVATE_KEY") {
        Ok(i) => i.to_string(),
        Err(err) => return Err(err.to_string().as_str()),
    };
    Ok(private_key_str == PRODUCTION_MODE)
}
