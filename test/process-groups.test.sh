#!/bin/bash

NF="node ../nf.js"

rm -rf sandbox
mkdir -p sandbox

cat << EOF > sandbox/Procfile
a: sleep 1
b: /bin/sh -c "sleep 10000 && exit 1"
EOF

# We'll exit with a code that cannot be used as a signal. This exposes a
# potential bug in termination handling.
$NF --procfile sandbox/Procfile start >sandbox/groups.txt 2>&1 && exit 0
exit 1
