// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('assert');
var envs   = require('../lib/envs');

var parsedHash = envs.keyValue(
  '#commented heading. \n' +
  'key = "quoted#hash" \n' +
  'key2 = stripped#comment \n' +
  'key3 = base64=== \n'
);

assert.equal(parsedHash.key, 'quoted#hash');
assert.equal(parsedHash.key2, 'stripped');
assert.equal(parsedHash.key3, 'base64===');
