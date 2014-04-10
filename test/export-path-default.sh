#!/bin/bash

NF="node ../nf.js"

rm -rf sandbox
mkdir -p sandbox

echo "PATH=something-totally-bogus" > sandbox/.env
echo "web: node app.js" > sandbox/Procfile

node ../nf.js export --out sandbox --type upstart-single \
  --env sandbox/.env --procfile sandbox/Procfile

grep 'env PATH="something-totally-bogus"' sandbox/foreman-web.conf || exit $?
