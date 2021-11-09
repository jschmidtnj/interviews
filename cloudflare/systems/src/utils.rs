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
        Ok(i) => match i {
            Some(cookies) => {
                let mut jar = cookie::CookieJar::new();
                for cookie in cookies.split(';') {
                    let trimmed = cookie.to_string().trim().to_string();
                    let split = trimmed.split('=').collect::<Vec<&str>>();
                    if split.len() < 2 {
                        continue;
                    }
                    if split.len() != 2 {
                        return Err(format!("invalid cookie {}", split[0].to_string()));
                    }
                    let cookie_obj = Cookie::new(split[0].to_string(), split[1].to_string());
                    jar.add(cookie_obj);
                }
                jar
            }
            None => return Err("no cookies found".to_string()),
        },
        Err(err) => return Err(err.to_string()),
    };
    Ok(cookies)
}
