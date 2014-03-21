var assert = require('assert')
  , envs   = require('../lib/envs')

var json = {
  "top": {
    "middle": {
      "bottom": "value"
    },
    "other": [ "zero", "one", "two" ]
  },
  "last": 42
}
var flattened = {
  'TOP_MIDDLE_BOTTOM': 'value',
  'TOP_OTHER_0': 'zero',
  'TOP_OTHER_1': 'one',
  'TOP_OTHER_2': 'two',
  'LAST': 42,
}

var dumped = [
  'TOP_MIDDLE_BOTTOM=value',
  'TOP_OTHER_0=zero',
  'TOP_OTHER_1=one',
  'TOP_OTHER_2=two',
  'LAST=42',
].join('\n') + '\n'

assert.deepEqual(envs.flattenJSON(json), flattened)
assert.equal(envs.dumpEnv(flattened), dumped)
