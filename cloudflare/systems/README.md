# systems

> submission for cloudflare

```bash
# compiles your project to WebAssembly and will warn of any issues
wrangler build 

# run your Worker in an ideal development workflow (with a local server, file watcher & more)
wrangler dev

# deploy your Worker globally to the Cloudflare network (update your wrangler.toml file for configuration)
wrangler publish
```

get it to compile

```bash
vim ~/.cargo/registry/src/github.com-1ecc6299db9ec823/der-0.4.4/src/encoder.rs
# remove the if statement, replace with Ok(())

cat keys/public.pem | wrangler secret put PUBLIC_KEY
cat keys/key_pair.pem | wrangler secret put KEY_PAIR
```
