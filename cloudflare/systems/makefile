build:
	make clean
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" src
	GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o dist/go.wasm go/wasm/main.go

clean:
	rm -rf .cache dist
