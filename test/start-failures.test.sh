#!/bin/bash
DIR=$(dirname "${BASH_SOURCE[0]}")
source $DIR/common.sh

NF="$DIR/../nf.js"

rm -rf $DIR/sandbox
mkdir -p $DIR/sandbox

assert_file <(node $NF --procfile $DIR/fixtures/nocmd.Procfile start 2>&1) \
            "Syntax Error in Procfile, Line 1: No Command Found"  
assert_file <(node $NF --procfile $DIR/fixtures/nokey.Procfile start 2>&1) \
            "Syntax Error in Procfile, Line 1: No Prockey Found"
assert_file <(cd $DIR && node ../nf.js --procfile $DIR/fixtures/nokey.Procfile start 2>&1) \
            "No Procfile and no package.json file found in Current Directory"
