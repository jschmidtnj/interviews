#!/bin/bash

set -e

output=chubb.zip

yarn prebuild

rm -f "$output"

zip -r "$output" * -x lib/\* node_modules/\* coverage/\*
