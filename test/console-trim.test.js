// Needed before requiring colors, otherwise its colorizers are no-ops.
process.stdout.isTTY = true;

var assert = require('chai').assert
  , util = require('util')
  , Console = require('../lib/console').Console
  , colors = require('../lib/colors')

var red = colors.red('red')
var blue = colors.blue('blue')

var long = 'Roses are red, Violets are blue, this string is long, and should be trimmed, too!'
var colorLong = long.replace('red', red).replace('blue', blue);

assert.lengthOf(long, 81)
assert.lengthOf(colorLong, 99)
assert.equal(Console.trim(colorLong, 50), Console.trim(long, 50))

assert.equal(Console.trim(colorLong, long.length), colorLong,
             'trim() should leave colors intact if no trimming is performed')

var indented = '       indented';
assert.equal(Console.trim(indented, 100), indented,
             'trim() should always preserve leading whitespace')
var padded  = '    padded    ';
var trimmed = '    padded';
assert.equal(Console.trim(padded, 100), trimmed,
             'trim() should always trim trailing whitespace')
