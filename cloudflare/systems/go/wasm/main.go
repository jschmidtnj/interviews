//+ build js,wasm

package main

import (
	"syscall/js"

	"github.com/jschmidtnj/interviews/cloudflare/go/wasm/shared"
)

var done = make(chan struct{})

func main() {
	if err := shared.GetKeys(); err != nil {
		panic(err)
	}
	// if err := shared.InitializeCloudflareClient(); err != nil {
	// 	panic(err)
	// }
	js.Global().Set("index", js.FuncOf(shared.Index))
	js.Global().Set("hello", js.FuncOf(shared.Hello))
	js.Global().Set("sign", js.FuncOf(shared.Sign))
	// js.Global().Set("verify", js.FuncOf(shared.Verify))
	<-done
}
