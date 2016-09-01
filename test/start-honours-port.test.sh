#!/bin/bash
cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

NF="node ../nf.js"

rm -rf sandbox
mkdir -p sandbox

node ../nf.js --procfile fixtures/Procfile.port --env fixtures/env.port start > sandbox/ports.txt

# default is 5000, env.port specifies 3000
assert_file sandbox/ports.txt 3000
assert_file sandbox/ports.txt 3100
assert_file sandbox/ports.txt 3200
