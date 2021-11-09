use std::env;
use cloudflare::framework::{auth, Environment, HttpApiClient, HttpApiClientConfig};

pub fn get_client() -> Result<HttpApiClient, String> {
    let token = match env::var("CF_TOKEN") {
        Ok(i) => i,
        Err(_err) => return Err("no cloudflare token found".to_string()),
    };
    let credentials = auth::Credentials::UserAuthToken {
        token
    };
    match HttpApiClient::new(credentials,
                             HttpApiClientConfig::default(),
                             Environment::Production) {
        Ok(i) => Ok(i),
        Err(err) => return Err(err.to_string()),
    }
}

pub fn get_account() -> Result<String, String> {
    match env::var("CF_ACCOUNT_ID") {
        Ok(i) => Ok(i),
        Err(err) => Err(err.to_string()),
    }
}

pub fn get_auth_namespace() -> Result<String, String> {
    match env::var("CF_AUTH_NAMESPACE") {
        Ok(i) => Ok(i),
        Err(err) => Err(err.to_string()),
    }
}
