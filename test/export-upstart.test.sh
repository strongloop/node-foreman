#!/bin/bash

NF="node ../nf.js"
SED=`which gsed || which sed`

mkdir -p sandbox
rm -rf sandbox/*

PATH=$(dirname $(which node)) $NF export \
  --app upstart-test --user test-user \
  --out sandbox --type upstart \
  --env fixtures/env.env --procfile fixtures/Procfile

$SED -i -e "s%$(pwd)%TEST_DIR%g" sandbox/*

diff -r -u fixtures/upstart sandbox 1>&2 || exit $?
