#!/bin/bash
cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

NF="node ../nf.js"
SED=`which gsed || which sed`

rm -rf sandbox
mkdir -p sandbox

PATH=$(dirname $(which node)) assert_exit $NF export \
  --app upstart-test --user test-user \
  --out sandbox --type upstart \
  --cwd '/EXPORT/PATH' \
  --env fixtures/env.env --procfile fixtures/Procfile

$SED -i '' -e "s%$(pwd)%TEST_DIR%g" \
        -e "s%$(dirname $(which node))%TEST_PATH%g" sandbox/*

# Fixtures can be updated to match output by running `npm test --update-fixtures`
test -n "$npm_config_update_fixtures" && cp sandbox/* fixtures/upstart/

assert_exit diff -r -u fixtures/upstart sandbox
