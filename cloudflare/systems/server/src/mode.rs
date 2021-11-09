use std::env;

const PRODUCTION_MODE: &str = "production";

pub fn is_production() -> Result<bool, String> {
    let mode_str = match env::var("MODE") {
        Ok(i) => i,
        Err(_err) => PRODUCTION_MODE.to_string(),
    };
    Ok(mode_str == PRODUCTION_MODE.to_string())
}
