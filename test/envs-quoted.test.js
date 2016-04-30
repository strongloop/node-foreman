// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var tap    = require('tap');
var envs   = require('../lib/envs');

var parsedHash = envs.keyValue(
  '#commented heading. \n' +
  'key = "quoted#hash" \n' +
  'key2 = stripped#comment \n' +
  'key3 = base64=== \n'
);

tap.equal(parsedHash.key, 'quoted#hash');
tap.equal(parsedHash.key2, 'stripped');
tap.equal(parsedHash.key3, 'base64===');
