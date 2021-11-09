#!/bin/bash

set -e

ssh-keygen -t rsa -b 4096 -m PEM -f private.pem
# no password
openssl rsa -in private.pem -pubout -outform PEM -out public.pem

rm -f private.pem.pub

cat public.pem private.pem > key_pair.pem
