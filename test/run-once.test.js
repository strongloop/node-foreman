// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('assert');
var rimraf = require('rimraf');
var fs     = require('fs');
var once   = require('../lib/proc').once;

var envs = { FILENAME: "should-also-exist.txt" };
var callbackCounter = 0;
var callbackIncrementer = function(code){
    if(code === 0) {
        callbackCounter++;
    }
};

rimraf.sync('./sandbox');
fs.mkdirSync('./sandbox');
process.chdir('./sandbox');

assert.equal(fs.existsSync('./should-exist.txt'), false);
assert.equal(fs.existsSync('./should-also-exist.txt'), false);
assert.equal(fs.existsSync('./should-not-exist.txt'), false);

once("touch should-exist.txt", null, callbackIncrementer);
// TODO: this is currently OS dependent, but we should probably do the
// expansion ourselves
if (process.platform === 'win32') {
  once("touch %FILENAME%", envs, callbackIncrementer);
} else {
  once("touch $FILENAME", envs, callbackIncrementer);
}

process.on('exit', function() {
    assert.equal(callbackCounter, 2);
    assert.equal(fs.existsSync('./should-exist.txt'), true);
    assert.equal(fs.existsSync('./should-not-exist.txt'), false);
    assert.equal(fs.existsSync(envs.FILENAME), true, 'should exist: ' + envs.FILENAME);
});
