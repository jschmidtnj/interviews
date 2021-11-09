pub struct Keys {
    pub key_pair: String,
    pub public_key: String,
}

pub fn get_keys(ctx: &worker::RouteContext<()>) -> Result<Keys, String> {
    let key_pair = match ctx.secret("KEY_PAIR") {
        Ok(i) => i.to_string(),
        Err(_i) => return Err("no private key found".to_string()),
    };

    let public_key = match ctx.secret("PUBLIC_KEY") {
        Ok(i) => i.to_string(),
        Err(_i) => return Err("no public key found".to_string()),
    };

    let keys = Keys {
        key_pair,
        public_key,
    };

    Ok(keys)
}
