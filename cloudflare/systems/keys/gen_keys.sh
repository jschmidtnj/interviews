#!/bin/bash

set -e

ssh-keygen -t rsa -b 4096 -m PEM -f key_pair.pem
# no password
openssl rsa -in key_pair.pem -pubout -outform PEM -out public.pem

rm -f private.pem.pub
