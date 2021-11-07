//+ build js,wasm

package shared

// import (
// 	"context"
// 	_ "embed"
// 	"syscall/js"

// 	"github.com/cloudflare/cloudflare-go"
// )

// var (
// 	cfClient *cloudflare.API
// )

// // InitializeCloudflareClient creates a new Cloudflare API client
// func InitializeCloudflareClient() error {
// 	apiKey := js.Global().Get("API_KEY").String()
// 	email := js.Global().Get("EMAIL").String()
// 	accountID := js.Global().Get("ACCOUNT_ID").String()
// 	var err error
// 	cfClient, err = cloudflare.New(apiKey, email, cloudflare.UsingAccount(accountID))

// 	return err
// }

// func KVRead(key string, namespaceID string) ([]byte, error) {
// 	value, err := cfClient.ReadWorkersKV(
// 		context.Background(),
// 		namespaceID,
// 		key,
// 	)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return value, nil
// }
