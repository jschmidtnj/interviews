# api

- `cargo watch -x run`
- GET http://localhost:8080/webui - see proxied web ui
- ANY http://localhost:8080/* - run proxied request
- PUT http://localhost:8080/login - sign up / login to the service (get jwt token)
- POST http://localhost:8080/keys - add new api key
- GET http://localhost:8080/keys - list user's api keys
- GET http://localhost:8080/keys/<key_id> - get information about specific key
- GET http://localhost:8080/keys/<key_id>/use - use specific key (w/ cookie)
- DELETE http://localhost:8080/keys/<key_id> - deactivate specific key

TODO:
- logging
- validation error message parsing
- hash api keys before storage
