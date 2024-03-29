use cfg_if::cfg_if;
use http::Method;
use http::header::{CACHE_CONTROL, CONTENT_TYPE, ORIGIN, REFERER};
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

pub const ISSUER: &str = "PostIt Monster";
pub const AUDIENCE: &str = "post-it-users";
pub const AUTH_COOKIE: &str = "token";

#[allow(dead_code)]
pub const AUTH_KV: &str = "AUTH";

pub const MIN_LIST_LIMIT: u64 = 10;
pub const VISIT_PREFIX: &str = "visit_";
pub const USER_PREFIX: &str = "user_";
pub const NUM_ENCODES_KEY: &str = "num_encodes";
pub const SUM_ENCODES_KEY: &str = "sum_encodes";
pub const NUM_DECODES_KEY: &str = "num_decodes";
pub const SUM_DECODES_KEY: &str = "sum_decodes";

#[derive(Serialize, Deserialize)]
pub struct Visit {
    pub time: usize,
    pub user: String,
}

pub struct CorsParams {
    pub allowed_methods: Vec::<Method>,
    pub allowed_headers: Vec::<String>,
}

pub fn get_cors_params() -> CorsParams {
    CorsParams {
        allowed_methods: vec![Method::GET],
        allowed_headers: vec![REFERER.to_string(), ORIGIN.to_string(),
                              CONTENT_TYPE.to_string(), CACHE_CONTROL.to_string(),
                              "sentry-trace".to_string()],
    }
}
