#!/bin/bash

NF="node ../nf.js"

rm -rf sandbox
mkdir -p sandbox

# We'll exit with a code that cannot be used as a signal. This exposes a
# potential bug in termination handling.
printf "exitwithcode: sudo sleep 1\ncrashafterawhile: sleep 0.5; exit 123" > sandbox/Procfile
node ../nf.js --procfile sandbox/Procfile start >sandbox/eperm.txt 2>&1 && exit 0

exit 1

