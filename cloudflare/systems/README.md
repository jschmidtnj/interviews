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

install openssl

from https://stackoverflow.com/a/49578644 and https://askubuntu.com/a/742712

```bash
wget http://www.openssl.org/source/openssl-1.0.1g.tar.gz
wget http://www.openssl.org/source/openssl-1.0.1g.tar.gz.md5
md5sum openssl-1.0.1g.tar.gz
cat openssl-1.0.1g.tar.gz.md5
tar -xvzf openssl-1.0.1g.tar.gz
cd openssl-1.0.1g
./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl
make
sudo make install_sw
```
