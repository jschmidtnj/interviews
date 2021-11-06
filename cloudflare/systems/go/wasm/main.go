//+ build js,wasm

package main

import (
	"syscall/js"

	"github.com/jschmidtnj/interviews/cloudflare/go/wasm/shared"
)

var done = make(chan struct{})

func main() {
	js.Global().Set("index", js.FuncOf(shared.Index))
	js.Global().Set("hello", js.FuncOf(shared.Hello))
	<-done
}
