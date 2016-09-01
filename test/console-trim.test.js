// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: foreman
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Needed before requiring colors, otherwise its colorizers are no-ops.
process.stdout.isTTY = true;

var Console = require('../lib/console').Console;
var colors = require('../lib/colors');
var tap = require('tap');

var red = colors.red('red');
var blue = colors.blue('blue');

var long = 'Roses are red, Violets are blue, this string is long, and should be trimmed, too!';
var colorLong = long.replace('red', red).replace('blue', blue);

tap.test(function(t) {
  t.equal(long.length, 81);
  t.equal(colorLong.length, 99);
  t.equal(Console.trim(colorLong, 50), Console.trim(long, 50));

  t.equal(Console.trim(colorLong, long.length), colorLong,
              'trim() should leave colors intact if no trimming is performed');

  var indented = '       indented';
  t.equal(Console.trim(indented, 100), indented,
              'trim() should always preserve leading whitespace');
  var padded  = '    padded    ';
  var trimmed = '    padded';
  t.equal(Console.trim(padded, 100), trimmed,
              'trim() should always trim trailing whitespace');
  t.end();
});
