use openssl::rsa::{Rsa};

pub fn get_keys(env: &worker::Env) -> Result<(), &str> {
    let privateKeyStr = match env.secret("PRIVATE_PEM") {
        Ok(i) => i,
        Err(_i) => return Err("no private key found"),
    };
    let privateKey = Rsa::private_key_from_pem(privateKeyStr);
    Ok(())
}
