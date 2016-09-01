// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var tap    = require('tap');
var envs   = require('../lib/envs');

var emptyEnvs = ['', '\n', ' \n \n \n'];

emptyEnvs.forEach(function (env) {
  var loaded = envs.keyValue(env);
  // {} == {}
  tap.equal(Object.keys(loaded).length, 0);
});

tap.equal(envs.dumpEnv({}), '\n');
