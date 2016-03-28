var assert = require('chai').assert
  , Console = require('../lib/console').Console

assert.deepEqual(['foo ', 'bar ', 'biz '], Console.wrap('foo bar biz ', 4))
assert.deepEqual(['foo bar biz '], Console.wrap('foo bar biz ', 500))
assert.deepEqual(['foo bar biz '], Console.wrap('foo bar biz ', 0))
