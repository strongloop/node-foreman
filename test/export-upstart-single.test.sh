#!/bin/bash

NF="node ../nf.js"

mkdir -p sandbox
rm -rf sandbox/*

PATH=$(dirname $(which node)) $NF export --app upstart-single-test \
  --out sandbox --type upstart-single \
  --env fixtures/env.env --procfile fixtures/Procfile

diff -r -u fixtures/upstart-single sandbox 1>&2 || exit $?
