build:
	make clean
	GOOS=js GOARCH=wasm go build -o dist/static/dist.wasm go/wasm/main.go

clean:
	rm -rf .cache dist
