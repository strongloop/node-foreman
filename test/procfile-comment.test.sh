#!/bin/bash

NF="node ../nf.js"
SED=`which gsed || which sed`

rm -rf sandbox
mkdir -p sandbox

echo "PATH=something-totally-bogus" > sandbox/.env
printf "#norun: touch should-not-exist.js\nrun: touch should-exist.js\n# norun: touch should-not-exist-2.js\n" > sandbox/Procfile

node ../nf.js export --out sandbox --env sandbox/.env --type upstart-single --procfile sandbox/Procfile

$SED -i -e "s%$(pwd)%TEST_DIR%g" \
        -e "s%$(dirname $(which node))%TEST_PATH%g" sandbox/*

# Fixtures can be updated to match output by running `npm test --update-fixtures`
test -n "$npm_config_update_fixtures" && cp sandbox/* fixtures/procfile-comment/

diff -r -u fixtures/procfile-comment sandbox 1>&2 || exit $?
