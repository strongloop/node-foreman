#!/bin/bash

NF="node ../nf.js"

mkdir -p sandbox
rm -rf sandbox/*

PATH=$(dirname $(which node)) $NF export \
  --app systemd-test --user test-user \
  --out sandbox --type systemd \
  --env fixtures/env.env --procfile fixtures/Procfile

gsed -i -e "s%$(pwd)%TEST_DIR%g" sandbox/*

diff -r -u fixtures/systemd sandbox 1>&2 || exit $?
