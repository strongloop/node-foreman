// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('assert');
var envs   = require('../lib/envs');

var input = '### This is a config file...\n' +
            '   \n' +
            '# Very important setting!\n' +
            'setting = important\n' +
            '   \n' +
            '# Dangerous, we should commend this out: \n' +
            '# DANGER = HIGH VOLTAGE   \n' +
            '    \n' +
            '# end \n';

var expected = 'setting=important\n';

var loadedEnv = envs.keyValue(input);
var dumpedEnv = envs.dumpEnv(loadedEnv);
var loadedFlat = envs.keyValue(expected);
var dumpedFlat = envs.dumpEnv(loadedFlat);
assert.equal(dumpedEnv, expected);
assert.equal(dumpedFlat, expected);
