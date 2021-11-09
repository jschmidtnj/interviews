use http::StatusCode;
use worker::*;
use serde::{Serialize};
use crate::shared::utils::{Visit, AUTH_KV, VISIT_PREFIX, NUM_ENCODES_KEY, NUM_DECODES_KEY, SUM_ENCODES_KEY, SUM_DECODES_KEY};

const README: &str = include_str!("../../README.txt");

pub fn readme(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    return Response::ok(README.to_string());
}

#[derive(Serialize)]
struct StatsRes {
    average_encode: String,
    average_decode: String,
    num_visits: u64,
    visits: Vec<Visit>,
}

const MAX_VISITS: u64 = 10;

pub async fn stats(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let auth = match ctx.kv(AUTH_KV) {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let keys = match auth.list().prefix(String::from(VISIT_PREFIX)).limit(MAX_VISITS).execute().await {
        Ok(i) => i,
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    }.keys;

    let mut visits: Vec<Visit> = vec![];
    for key in keys.into_iter() {
        let visit = match auth.get(key.name.as_str()).await {
            Ok(i) => match i.unwrap().as_json::<Visit>() {
                Ok(i) => i,
                Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
            },
            Err(_err) => return Response::error(format!("cannot get key {}", key.name), StatusCode::BAD_REQUEST.as_u16()),
        };
        visits.push(visit);
    }
    let num_encode = match auth.get(NUM_ENCODES_KEY).await {
        Ok(i) => match i {
            Some(i) => i.as_string().parse::<u64>().unwrap(),
            None => 0,
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let num_decode = match auth.get(NUM_DECODES_KEY).await {
        Ok(i) => match i {
            Some(i) => i.as_string().parse::<u64>().unwrap(),
            None => 0,
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let sum_encode = match auth.get(SUM_ENCODES_KEY).await {
        Ok(i) => match i {
            Some(i) => i.as_string().parse::<u64>().unwrap(),
            None => 0,
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let sum_decode = match auth.get(SUM_DECODES_KEY).await {
        Ok(i) => match i {
            Some(i) => i.as_string().parse::<u64>().unwrap(),
            None => 0,
        },
        Err(err) => return Response::error(err.to_string(), StatusCode::INTERNAL_SERVER_ERROR.as_u16()),
    };
    let res = StatsRes {
        average_encode: format!("{:.2}", sum_encode as f64 / if num_encode == 0 { 1 } else { num_encode } as f64),
        average_decode: format!("{:.2}", sum_decode as f64 / if num_decode == 0 { 1 } else { num_decode } as f64),
        num_visits: num_encode + num_decode,
        visits,
    };
    return Response::from_json::<StatsRes>(&res);
}
