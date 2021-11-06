//+ build js,wasm

package shared

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"syscall/js"
)

var (
	privateKey rsa.PrivateKey
)

func GetKeys() error {
	privatePem := []byte(js.Global().Get("PRIVATE_KEY").String())
	privPem, _ := pem.Decode(privatePem)
	if privPem.Type != "RSA PRIVATE KEY" {
		return errors.New("invalid rsa private key provided")
	}

	privateKeyPassword := []byte(js.Global().Get("PRIVATE_KEY_PASSWORD").String())

	//lint:ignore SA1019 need to use pem for storing rsa
	privPemBytes, err := x509.DecryptPEMBlock(privPem, []byte(privateKeyPassword))
	if err != nil {
		return err
	}

	var parsedKey interface{}
	if parsedKey, err = x509.ParsePKCS1PrivateKey(privPemBytes); err != nil {
		if parsedKey, err = x509.ParsePKCS8PrivateKey(privPemBytes); err != nil { // note this returns type `interface{}`
			return err
		}
	}

	privateKeyInterface, ok := parsedKey.(*rsa.PrivateKey)
	if !ok {
		return errors.New("unable to cast private key to rsa private key")
	}
	privateKey = *privateKeyInterface

	publicPem := []byte(js.Global().Get("PUBLIC_KEY").String())

	pubPem, _ := pem.Decode(publicPem)
	if pubPem == nil {
		return errors.New("cannot find public key")
	}

	if pubPem.Type != "PUBLIC KEY" {
		return errors.New("invalid public key provided")
	}

	if parsedKey, err = x509.ParsePKIXPublicKey(pubPem.Bytes); err != nil {
		return err
	}

	var pubKey *rsa.PublicKey
	if pubKey, ok = parsedKey.(*rsa.PublicKey); !ok {
		return errors.New("unable to cast public key to rsa public key")
	}

	privateKey.PublicKey = *pubKey

	return nil
}
