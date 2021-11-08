pub struct Keys {
    pub private_key: String,
    pub public_key: String,
}

pub fn get_keys(ctx: &worker::RouteContext<()>) -> Result<Keys, String> {
    let private_key_str = match ctx.secret("PRIVATE_KEY") {
        Ok(i) => i.to_string(),
        Err(_i) => return Err("no private key found".to_string()),
    };
    let private_key_password = match ctx.secret("PRIVATE_KEY_PASSWORD") {
        Ok(i) => i.to_string(),
        Err(_i) => return Err("no private key password found".to_string()),
    };
    println!("{}", private_key_password);

    let public_key_str = match ctx.secret("PUBLIC_KEY") {
        Ok(i) => i.to_string(),
        Err(_i) => return Err("no public key found".to_string()),
    };

    let keys = Keys {
        private_key: private_key_str,
        public_key: public_key_str,
    };

    Ok(keys)
}
