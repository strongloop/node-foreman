#!/bin/bash
DIR=$(dirname "${BASH_SOURCE[0]}")
source $DIR/common.sh

NODE=$(which node)
NF="$DIR/../nf.js"
SED=`which gsed || which sed`

comment $(env | grep NYC)

assert_sandbox_contents() {
  fixture=$1

  $SED -i '' -e "s%/EXPORT/PATH%TEST_DIR%g" \
          -e "s%$(pwd)%TEST_DIR%g" \
          -e "s%$(dirname $NODE)%TEST_PATH%g" $DIR/sandbox/*

  # Fixtures can be updated to match output by running `npm test --update-fixtures`
  if test -n "$npm_config_update_fixtures"; then
    mkdir -p $DIR/fixtures/$fixture
    cp $DIR/sandbox/* $DIR/fixtures/$fixture/
  fi

  assert_exit diff -r -u $DIR/fixtures/$fixture $DIR/sandbox
}

test_exporter() {
  type=$1
  fixture=$2
  args=$3
  rm -rf $DIR/sandbox
  mkdir -p $DIR/sandbox
  PATH=$(dirname $NODE) assert_exit $NODE $NF export \
    --app $type-test --user test-user \
    --out $DIR/sandbox --type $type \
    $args \
    --cwd '/EXPORT/PATH' \
    --env $DIR/fixtures/env.env --procfile $DIR/fixtures/Procfile
  assert_sandbox_contents $fixture
}

test_exporter "upstart" "upstart"
test_exporter "upstart-single" "upstart-single"
comment "custom template path, relative"
test_exporter "upstart" "upstart-custom" "--template test/fixtures/upstart-custom-templates"
comment "custom template path, absolute"
test_exporter "upstart" "upstart-custom" "--template $DIR/fixtures/upstart-custom-templates"
test_exporter "systemd" "systemd"
test_exporter "supervisord" "supervisord"
test_exporter "smf" "smf"

comment "trivial configs"
rm -rf $DIR/sandbox
mkdir -p $DIR/sandbox
echo "PATH=something-totally-bogus" > $DIR/sandbox/.env
echo "web: node app.js" > $DIR/sandbox/Procfile
assert_exit $NODE $NF export \
  --out $DIR/sandbox --type upstart-single \
  --env $DIR/sandbox/.env --procfile $DIR/sandbox/Procfile
assert_file $DIR/sandbox/foreman-web.conf 'env PATH="something-totally-bogus"'

comment "comments in Procfile"
rm -rf $DIR/sandbox
mkdir -p $DIR/sandbox
assert_exit $NODE $NF export \
  --out $DIR/sandbox --type upstart-single \
  --env $DIR/fixtures/procfile-comment.env \
  --procfile $DIR/fixtures/procfile-comment.Procfile
assert_sandbox_contents procfile-comment
