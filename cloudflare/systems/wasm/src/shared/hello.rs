use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct MessageRes {
    message: String,
}

pub fn index() -> MessageRes {
    let message = MessageRes {
        message: "Auth API".to_string(),
    };
    return message;
}

pub fn hello() -> MessageRes {
    let message = MessageRes {
        message: "hello world".to_string(),
    };
    return message;
}
