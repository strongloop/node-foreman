#!/bin/bash
cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

NF="node ../nf.js"

rm -rf sandbox
mkdir -p sandbox

PORT=4000 node ../nf.js --procfile fixtures/Procfile.port --env fixtures/env.empty start > sandbox/ports.txt

# default is 5000, actual environment specifies 4000
assert_file sandbox/ports.txt 4000
assert_file sandbox/ports.txt 4100
assert_file sandbox/ports.txt 4200
