use std::fs;
use std::path::Path;

pub struct Keys {
    pub key_pair: String,
    pub public_key: String,
}

pub fn get_keys() -> Result<Keys, String> {
    let path_str = match std::env::var("KEY_PATH") {
        Ok(i) => i,
        Err(_err) => return Err("no key path env var found".to_string()),
    };
    let path = Path::new(&path_str);

    let key_pair = match fs::read_to_string(path.to_owned().join("key_pair.pem")) {
        Ok(i) => i,
        Err(err) => return Err(err.to_string()),
    };

    let public_key = match fs::read_to_string(path.to_owned().join("public.pem")) {
        Ok(i) => i,
        Err(err) => return Err(err.to_string()),
    };

    let keys = Keys {
        key_pair,
        public_key,
    };

    Ok(keys)
}
