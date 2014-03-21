var assert = require('assert')
  , envs   = require('../lib/envs')

var emptyEnvs = ['', '\n', ' \n \n \n']

emptyEnvs.forEach(function (env) {
  var loaded = envs.KeyValue(env)
  // {} == {}
  assert.equal(Object.keys(loaded).length, 0)
})

assert.equal(envs.dumpEnv({}), '\n')
