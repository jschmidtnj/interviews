//+ build js,wasm

package shared

import (
	"encoding/json"
	"syscall/js"
	"time"

	"github.com/golang-jwt/jwt"
)

type SignRes struct {
	JWT       string `json:"jwt"`
	PublicKey string `json:"publicKey"`
}

func Sign(_ js.Value, input []js.Value) interface{} {
	username := input[0].String()
	callback := input[1]

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": username,
		"iat": time.Now().Unix(),
		"nbf": time.Now().Unix(),
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString("secret")
	if err != nil {
		callback.Invoke(err.Error(), nil)
		return nil
	}

	res := SignRes{
		JWT:       tokenString,
		PublicKey: "key",
	}
	res_bytes, err := json.Marshal(res)
	if err != nil {
		callback.Invoke(err.Error(), nil)
		return nil
	}
	callback.Invoke(nil, string(res_bytes))
	return nil
}
