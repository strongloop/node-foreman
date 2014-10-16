var assert = require('assert')
  , rimraf = require('rimraf')
  , fs     = require('fs')
  , once   = require('../lib/proc').once

var envs = { FILENAME: "should-also-exist.txt" }

rimraf.sync('./sandbox')
fs.mkdirSync('./sandbox')
process.chdir('./sandbox')

assert.equal(fs.existsSync('./should-exist.txt'), false);
assert.equal(fs.existsSync('./should-also-exist.txt'), false);
assert.equal(fs.existsSync('./should-not-exist.txt'), false);

once("touch should-exist.txt", null, function() {
    assert.equal(fs.existsSync('./should-exist.txt'), true);
    assert.equal(fs.existsSync('./should-not-exist.txt'), false);
});

once("touch $FILENAME", envs, function() {
    assert.equal(fs.existsSync(envs.FILENAME), true);
    assert.equal(fs.existsSync('./should-not-exist.txt'), false);
});
