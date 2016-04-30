#!/bin/bash
cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

NF="node ../nf.js"

rm -rf sandbox
mkdir -p sandbox

echo "PATH=something-totally-bogus" > sandbox/.env
echo "web: node app.js" > sandbox/Procfile

assert_exit node ../nf.js export --out sandbox --type upstart-single \
  --env sandbox/.env --procfile sandbox/Procfile

assert_file sandbox/foreman-web.conf 'env PATH="something-totally-bogus"'
