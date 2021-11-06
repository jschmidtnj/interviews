//+ build js,wasm

package shared

import (
	"encoding/json"
	"syscall/js"
)

type MessageRes struct {
	Message string `json:"message"`
}

func Index(_this js.Value, args []js.Value) interface{} {
	callback := args[0]
	res := MessageRes{Message: "Auth API"}
	res_bytes, err := json.Marshal(res)
	if err != nil {
		return callback.Invoke(err.Error(), nil).String()
	}
	return callback.Invoke(nil, string(res_bytes)).String()
}

func Hello(_this js.Value, args []js.Value) interface{} {
	callback := args[0]
	res := MessageRes{Message: "hello world"}
	res_bytes, err := json.Marshal(res)
	if err != nil {
		return callback.Invoke(err.Error(), nil).String()
	}
	return callback.Invoke(nil, string(res_bytes)).String()
}
