use cfg_if::cfg_if;
use cookie::{Cookie, CookieJar};
use http::StatusCode;
use worker::Response;

cfg_if! {
    // https://github.com/rustwasm/console_error_panic_hook#readme
    if #[cfg(feature = "console_error_panic_hook")] {
        extern crate console_error_panic_hook;
        pub use self::console_error_panic_hook::set_once as set_panic_hook;
    } else {
        #[inline]
        pub fn set_panic_hook() {}
    }
}

pub fn get_cookies(req: worker::Request) -> Result<CookieJar, &str> {
    let cookies = match req.headers().get("Cookie") {
        Ok(cookies) => {
            let mut jar = cookie::CookieJar::new();
            cookies.unwrap().split(';').map(|curr| -> Cookie {
                let keyVal = String::from(curr).trim().split('=');
                return Cookie::new(keyVal[0], keyVal[1]);
            }).map(|curr| -> () {
                jar.add(cookie)
            });
            jar
        }
        Err(err) => err.to_string(),
    };
    Ok(cookies)
}
