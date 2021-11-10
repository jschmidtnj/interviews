use serde::{Serialize};
use crate::auth::{get_account, get_auth_namespace, get_client};
use actix_web::{get, HttpResponse};
use cloudflare::endpoints::workerskv::list_namespace_keys::{ListNamespaceKeys, ListNamespaceKeysParams};
use cloudflare::endpoints::workerskv::read::Read;
use cloudflare::framework::apiclient::ApiClient;
use crate::shared::utils::{Visit, VISIT_PREFIX, NUM_ENCODES_KEY, NUM_DECODES_KEY, SUM_ENCODES_KEY, SUM_DECODES_KEY, MIN_LIST_LIMIT};

const README: &str = include_str!("../../README.md");

#[get("/README.md")]
pub fn readme() -> HttpResponse {
    HttpResponse::Ok().body(README.to_string())
}

#[get("/README.txt")]
pub fn readme_txt() -> HttpResponse {
    HttpResponse::Ok().body(README.to_string())
}

#[derive(Serialize)]
struct StatsRes {
    average_encode: String,
    average_decode: String,
    num_visits: u64,
    visits: Vec<Visit>,
}

const MAX_VISITS: u64 = 1;

#[get("/stats")]
pub async fn stats() -> HttpResponse {
    let client = match get_client() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let account = match get_account() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let auth_namespace = match get_auth_namespace() {
        Ok(i) => i,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };
    let keys = match client.request(&ListNamespaceKeys {
        account_identifier: account.as_str(),
        params: ListNamespaceKeysParams {
            prefix: Some(VISIT_PREFIX.to_string()),
            limit: Some(if MAX_VISITS >= MIN_LIST_LIMIT { MAX_VISITS } else { MIN_LIST_LIMIT } as u16),
            ..Default::default()
        },
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result,
        Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
    };

    let mut visits: Vec<Visit> = vec![];
    for key in keys.into_iter() {
        let visit = match client.request_text(&Read {
            key: key.name.as_str(),
            account_identifier: account.as_str(),
            namespace_identifier: auth_namespace.as_str(),
        }) {
            Ok(i) => match serde_json::from_str::<Visit>(i.result.as_str()) {
                Ok(i) => i,
                Err(err) => return HttpResponse::InternalServerError().body(err.to_string()),
            },
            Err(err) => return HttpResponse::BadRequest().body(err.to_string()),
        };
        visits.push(visit);
        if visits.len() == MAX_VISITS as usize {
            break;
        }
    }

    let num_encode = match client.request_text(&Read {
        key: NUM_ENCODES_KEY,
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result.parse::<u64>().unwrap(),
        Err(_err) => 0,
    };

    let num_decode = match client.request_text(&Read {
        key: NUM_DECODES_KEY,
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result.parse::<u64>().unwrap(),
        Err(_err) => 0,
    };
    let sum_encode = match client.request_text(&Read {
        key: SUM_ENCODES_KEY,
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result.parse::<u64>().unwrap(),
        Err(_err) => 0,
    };
    let sum_decode = match client.request_text(&Read {
        key: SUM_DECODES_KEY,
        account_identifier: account.as_str(),
        namespace_identifier: auth_namespace.as_str(),
    }) {
        Ok(i) => i.result.parse::<u64>().unwrap(),
        Err(_err) => 0,
    };
    let res = StatsRes {
        average_encode: format!("{:.2}", sum_encode as f64 / if num_encode == 0 { 1 } else { num_encode } as f64),
        average_decode: format!("{:.2}", sum_decode as f64 / if num_decode == 0 { 1 } else { num_decode } as f64),
        num_visits: num_encode + num_decode,
        visits,
    };
    HttpResponse::Ok().json(res)
}
