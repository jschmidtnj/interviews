use cookie::{Cookie, CookieJar};

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
