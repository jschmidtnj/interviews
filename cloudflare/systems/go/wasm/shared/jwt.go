//+ build js,wasm

package shared

import (
	"encoding/json"
	"fmt"
	"syscall/js"
	"time"

	"github.com/golang-jwt/jwt"
)

type SignRes struct {
	JWT       string `json:"jwt"`
	PublicKey string `json:"publicKey"`
}

const UsernameClaim string = "sub"

func Sign(_ js.Value, input []js.Value) interface{} {
	username := input[0].String()
	callback := input[1]

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		UsernameClaim: username,
		"iat":         time.Now().Unix(),
		"nbf":         time.Now().Unix(),
		"exp":         time.Now().Add(time.Hour * 24).Unix(),
	})
	signing_string, err := token.SigningString()
	if err != nil {
		return callback.Invoke(err.Error(), nil).String()
	}
	tokenString, err := jwt.SigningMethodRS256.Sign(signing_string, privateKey)
	if err != nil {
		return callback.Invoke(err.Error(), nil).String()
	}

	res := SignRes{
		JWT:       tokenString,
		PublicKey: "key",
	}
	res_bytes, err := json.Marshal(res)
	if err != nil {
		return callback.Invoke(err.Error(), nil).String()
	}
	return callback.Invoke(nil, string(res_bytes)).String()
}

func Verify(_ js.Value, input []js.Value) interface{} {
	tokenString := input[0].String()
	callback := input[1]

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return privateKey.PublicKey, nil
	})

	if err != nil {
		return callback.Invoke(err.Error(), nil).String()
	}
	if !token.Valid {
		return callback.Invoke("invalid jwt token. might be expired", nil).String()
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return callback.Invoke("cannot cast claims from jwt", nil).String()
	}
	var username string
	if username, ok = claims[UsernameClaim].(string); !ok {
		return callback.Invoke(fmt.Sprintf("cannot find username in claim %s", UsernameClaim), nil).String()
	}

	return callback.Invoke(nil, username).String()
}
