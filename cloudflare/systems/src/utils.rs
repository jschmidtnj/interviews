use cfg_if::cfg_if;
use cookie::{Cookie, CookieJar};
use serde::{Serialize, Deserialize};

cfg_if! {
    // https://github.com/rustwasm/console_error_panic_hook#readme
    if #[cfg(feature = "console_error_panic_hook")] {
        extern crate console_error_panic_hook;
        pub use self::console_error_panic_hook::set_once as set_panic_hook;
    } else {
        // #[inline]
        // pub fn set_panic_hook() {}
    }
}

pub const AUTH_KV: &str = "AUTH";
pub const VISIT_PREFIX: &str = "visit_";
pub const NUM_ENCODES_KEY: &str = "num_encodes";
pub const SUM_ENCODES_KEY: &str = "sum_encodes";
pub const NUM_DECODES_KEY: &str = "num_decodes";
pub const SUM_DECODES_KEY: &str = "sum_decodes";

#[derive(Serialize, Deserialize)]
pub struct Visit {
    pub time: usize,
    pub user: String,
}

pub fn get_cookies(req: worker::Request) -> Result<CookieJar, String> {
    let cookies = match req.headers().get("Cookie") {
        Ok(cookies) => {
            let mut jar = cookie::CookieJar::new();

            for cookie in cookies.unwrap().split(';').map(|curr| -> Cookie {
                let trimmed = curr.to_string().trim().to_string();
                let split = trimmed.split('=').collect::<Vec<&str>>();
                return Cookie::new(split[0].to_string(), split[1].to_string());
            }) {
                jar.add(cookie);
            }
            jar
        }
        Err(err) => return Err(err.to_string()),
    };
    Ok(cookies)
}
