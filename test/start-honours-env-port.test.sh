#!/bin/bash

NF="node ../nf.js"

rm -rf sandbox
mkdir -p sandbox

PORT=4000 node ../nf.js --procfile fixtures/Procfile.port --env fixtures/env.empty start > sandbox/ports.txt

# default is 5000, actual environment specifies 4000
grep -q -F -e 4000 sandbox/ports.txt && \
        grep -q -F -e 4100 sandbox/ports.txt && \
        grep -q -F -e 4200 sandbox/ports.txt && exit 0

exit 1
