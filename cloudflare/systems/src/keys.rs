use openssl::pkey::{Private, Public};
use openssl::rsa::{Rsa};

struct Keys {
    pub private_key: Rsa<Private>,
    pub public_key: Rsa<Public>,
}

pub fn get_keys(ctx: &worker::RouteContext<()>) -> Result<Keys, &str> {
    let private_key_str = match ctx.secret("PRIVATE_KEY") {
        Ok(i) => i.to_string(),
        Err(_i) => return Err("no private key found"),
    };
    let private_key_password = match ctx.secret("PRIVATE_KEY_PASSWORD") {
        Ok(i) => i.to_string(),
        Err(_i) => return Err("no private key password found"),
    };
    let private_key = match Rsa::private_key_from_pem_passphrase(
        private_key_str.as_bytes(), private_key_password.as_bytes()) {
        Ok(i) => i,
        Err(err) => return Err(err.to_string().as_str()),
    };

    let public_key_str = match ctx.secret("PUBLIC_KEY") {
        Ok(i) => i.to_string(),
        Err(_i) => return Err("no public key found"),
    };
    let public_key = match Rsa::public_key_from_pem(public_key_str.as_bytes()) {
        Ok(i) => i,
        Err(err) => return Err(err.to_string().as_str()),
    };

    let keys = Keys {
        private_key,
        public_key,
    };

    Ok(keys)
}
