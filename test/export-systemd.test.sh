#!/bin/bash

NF="node ../nf.js"
SED=`which gsed || which sed`

rm -rf sandbox
mkdir -p sandbox

PATH=$(dirname $(which node)) $NF export \
  --app systemd-test --user test-user \
  --out sandbox --type systemd \
  --env fixtures/env.env --procfile fixtures/Procfile

$SED -i -e "s%$(pwd)%TEST_DIR%g" \
        -e "s%$(dirname $(which node))%TEST_PATH%g" sandbox/*

diff -r -u fixtures/systemd sandbox 1>&2 || exit $?
