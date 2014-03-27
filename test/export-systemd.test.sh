#!/bin/bash

NF="node ../nf.js"

mkdir -p sandbox
rm -rf sandbox/*

PATH=$(dirname $(which node)) $NF export --app systemd-test --out sandbox \
  --type systemd --env fixtures/env.env --procfile fixtures/Procfile

diff -r -u fixtures/systemd sandbox 1>&2 || exit $?
