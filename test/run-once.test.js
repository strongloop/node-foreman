// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var tap    = require('tap');
var rimraf = require('rimraf');
var fs     = require('fs');
var once   = require('../lib/proc').once;
var path   = require('path');

var envs = { FILENAME: "should-also-exist.txt" };

var SANDBOX = path.resolve(__dirname, 'sandbox');
rimraf.sync(SANDBOX);
fs.mkdirSync(SANDBOX);
process.chdir(SANDBOX);

tap.test('setup', function(t) {
  t.plan(3);
  fs.unlink('should-exist.txt', t.pass);
  fs.unlink('should-also-exist.txt', t.pass);
  fs.unlink('should-not-exist.txt', t.pass);
});

tap.test('preconditions', function(t) {
  t.plan(3);
  fileDoesNotExist(t, './should-exist.txt');
  fileDoesNotExist(t, './should-also-exist.txt');
  fileDoesNotExist(t, './should-not-exist.txt');
});

tap.test('literal', function(t) {
  once("touch should-exist.txt", null, function(code) {
    t.equal(code, 0);
    t.end();
  });
});

tap.test('expansion', function(t) {
  // TODO: this is currently OS dependent, but we should probably do the
  // expansion ourselves
  if (process.platform === 'win32') {
    once("touch %FILENAME%", envs, exitsCleanly);
  } else {
    once("touch $FILENAME", envs, exitsCleanly);
  }
  function exitsCleanly(code) {
    t.equal(code, 0);
    t.end();
  }
});

tap.test('verification', function(t) {
  t.plan(3);
  fileExists(t, './should-exist.txt');
  fileExists(t, './should-also-exist.txt');
  fileDoesNotExist(t, './should-not-exist.txt');
});

function fileExists(t, f) {
  fs.stat(f, function(err, _stat) {
    t.ifErr(err, 'file should exist: ' + f);
  });
}

function fileDoesNotExist(t, f) {
  fs.stat(f, function(err, _stat) {
    t.ok(err, 'file should NOT exist: ' + f);
  });
}
