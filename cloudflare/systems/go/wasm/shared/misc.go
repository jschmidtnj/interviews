//+ build js,wasm

package shared

import (
	_ "embed"
	"syscall/js"
)

//go:embed README.txt
var README string

func GetREADME(_ js.Value, input []js.Value) interface{} {
	callback := input[0]
	return callback.Invoke(nil, string(README)).String()
}

func Stats(_ js.Value, input []js.Value) interface{} {
	callback := input[0]

	return callback.Invoke(nil, "asdf").String()
}
