//+ build js,wasm

package shared

import (
	"syscall/js"

	"time"

	"github.com/golang-jwt/jwt"
	"github.com/jschmidtnj/interviews/cloudflare/go/wasm/templates"
)

type MessageRes struct {
	Message string `json:"message"`
}

func Index(_this js.Value, args []js.Value) interface{} {
	callback := args[0]
	res := templates.MessageRes{
		Message: "Auth API",
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "asdf123",
		"iat": time.Now().Unix(),
		"nbf": time.Now().Unix(),
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString("secret")
	if err != nil {
		callback.Invoke(err.Error(), nil)
		return nil
	}
	println(tokenString)
	return callback.Invoke(nil, res.JSON()).String()
}

func Hello(_this js.Value, args []js.Value) interface{} {
	callback := args[0]
	res := templates.MessageRes{
		Message: "Hello World",
	}
	return callback.Invoke(nil, res.JSON()).String()
}
