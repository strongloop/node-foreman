var assert = require('assert')
  , envs   = require('../lib/envs')

var parsedHash = envs.KeyValue(
  '#commented heading. \n' +
  'key = "quoted#hash" \n' +
  'key2 = stripped#comment \n' +
  'key3 = base64=== \n'
)

assert.equal(parsedHash['key'], 'quoted#hash')
assert.equal(parsedHash['key2'], 'stripped')
assert.equal(parsedHash['key3'], 'base64===')
