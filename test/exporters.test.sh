#!/bin/bash
DIR=$(dirname "${BASH_SOURCE[0]}")
source $DIR/common.sh

NF="$DIR/../nf.js"
SED=`which gsed || which sed`

test_exporter() {
  type=$1
  fixture=$2
  args=$3
  rm -rf $DIR/sandbox
  mkdir -p $DIR/sandbox
  PATH=$(dirname $(which node)) assert_exit $NF export \
    --app $type-test --user test-user \
    --out $DIR/sandbox --type $type \
    --cwd '/EXPORT/PATH' \
    --env $DIR/fixtures/env.env --procfile $DIR/fixtures/Procfile

  $SED -i '' -e "s%/EXPORT/PATH%TEST_DIR%g" \
          -e "s%$(pwd)%TEST_DIR%g" \
          -e "s%$(dirname $(which node))%TEST_PATH%g" $DIR/sandbox/*

  # Fixtures can be updated to match output by running `npm test --update-fixtures`
  if test -n "$npm_config_update_fixtures"; then
    mkdir -p $DIR/fixtures/$fixture
    cp $DIR/sandbox/* $DIR/fixtures/$fixture/
  fi

  assert_exit diff -r -u $DIR/fixtures/$fixture $DIR/sandbox
} 

test_exporter "upstart" "upstart"
test_exporter "upstart-single" "upstart-single"
test_exporter "systemd" "systemd"
test_exporter "supervisord" "supervisord"
test_exporter "smf" "smf"
