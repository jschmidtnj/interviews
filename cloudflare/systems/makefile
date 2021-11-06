build:
	make clean
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" src
	GOOS=js GOARCH=wasm go build -o dist/go.wasm go/wasm/main.go

# tried tinygo, but it's not necessary because wasm files aren't size bound
build-tiny:
	make clean
	cp "$(shell tinygo env TINYGOROOT)/targets/wasm_exec.js" src
	tinygo build -o dist/go.wasm -target wasm go/wasm/main.go

CF_KEYFILE=./.cf-keys
upload:
	(. $(CF_KEYFILE) && curl -X PUT \
		"https://api.cloudflare.com/client/v4/accounts/$$CF_ACCOUNT_ID/workers/scripts/$$CF_WORKER_NAME" \
	  -H "Authorization: Bearer $$CF_API_TOKEN" \
		-F "metadata=@dist/metadata.json;type=application/json" \
		-F "script=@dist/worker.js;type=application/javascript" \
		-F "wasm=@dist/go.wasm;type=application/wasm")

clean:
	rm -rf .cache dist
