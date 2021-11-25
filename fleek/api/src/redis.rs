extern crate redis;
extern crate r2d2_redis;

use r2d2_redis::{RedisConnectionManager, r2d2};
use r2d2_redis::r2d2::Pool;
use std::env;

pub type RedisPool = r2d2::Pool<RedisConnectionManager>;

pub fn get_redis_connection() -> Result<Pool<RedisConnectionManager>, String> {
    let redis_url = match env::var("REDIS_URL") {
        Ok(i) => i,
        Err(_err) => return Err("cannot find redis url in env".to_string()),
    };
    // let client = match redis::Client::open(redis_url) {
    //     Ok(i) => i,
    //     Err(err) => return Err(err.to_string()),
    // };
    // let connection = match client.get_connection() {
    //     Ok(i) => i,
    //     Err(err) => return Err(err.to_string()),
    // };
    let manager = match RedisConnectionManager::new(redis_url.as_str()) {
        Ok(i) => i,
        Err(err) => return Err(err.to_string()),
    };
    let pool = match r2d2::Pool::builder().build(manager) {
        Ok(i) => i,
        Err(err) => return Err(err.to_string()),
    };
    Ok(pool)
}
