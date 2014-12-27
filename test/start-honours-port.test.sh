#!/bin/bash

NF="node ../nf.js"

rm -rf sandbox
mkdir -p sandbox

node ../nf.js --procfile fixtures/Procfile.port --env fixtures/env.port start > sandbox/ports.txt

# default is 5000, env.port specifies 3000
grep -q -F -e 3000 sandbox/ports.txt && \
        grep -q -F -e 3100 sandbox/ports.txt && \
        grep -q -F -e 3200 sandbox/ports.txt && exit 0

exit 1
