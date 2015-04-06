var assert = require('assert')
  , envs   = require('../lib/envs')

var emptyEnvs = ['', '\n', ' \n \n \n']

emptyEnvs.forEach(function (env) {
  var loaded = envs.keyValue(env)
  // {} == {}
  assert.equal(Object.keys(loaded).length, 0)
})

assert.equal(envs.dumpEnv({}), '\n')
