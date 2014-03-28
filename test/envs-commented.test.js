var assert = require('assert')
  , envs   = require('../lib/envs')

var input = '### This is a config file...\n' +
            '   \n' +
            '# Very important setting!\n' +
            'setting = important\n' +
            '   \n' +
            '# Dangerous, we should commend this out: \n' +
            '# DANGER = HIGH VOLTAGE   \n' +
            '    \n' +
            '# end \n'

var expected = 'setting=important\n'

var loadedEnv = envs.KeyValue(input)
var dumpedEnv = envs.dumpEnv(loadedEnv)
var loadedFlat = envs.KeyValue(expected)
var dumpedFlat = envs.dumpEnv(loadedFlat)
assert.equal(dumpedEnv, expected)
assert.equal(dumpedFlat, expected)

var parsedHash = envs.KeyValue(
  '#commented heading. \n' +
  'key = "quoted#hash" \n' +
  'key2 = stripped#comment \n'
)

assert.equal(parsedHash['key'], 'quoted#hash')
assert.equal(parsedHash['key2'], 'stripped')
