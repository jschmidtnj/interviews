const PRODUCTION_MODE: &str = "production";

pub fn is_production(ctx: &worker::RouteContext<()>) -> Result<bool, String> {
    let mode_str = match ctx.var("MODE") {
        Ok(i) => i.to_string(),
        Err(err) => return Err(err.to_string()),
    };
    Ok(mode_str == PRODUCTION_MODE)
}
