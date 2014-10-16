var assert = require('assert')
  , rimraf = require('rimraf')
  , fs     = require('fs')
  , once   = require('../lib/proc').once

var envs = { FILENAME: "should-also-exist.txt" }
var callbackCounter = 0;
var callbackIncrementer = function(code){
    if(code==0){
        callbackCounter++;
    }
};

rimraf.sync('./sandbox')
fs.mkdirSync('./sandbox')
process.chdir('./sandbox')

assert.equal(fs.existsSync('./should-exist.txt'), false);
assert.equal(fs.existsSync('./should-also-exist.txt'), false);
assert.equal(fs.existsSync('./should-not-exist.txt'), false);

once("touch should-exist.txt", null, callbackIncrementer)
once("touch $FILENAME", envs, callbackIncrementer)

process.on('exit', function() {
    assert.equal(callbackCounter, 2)
    assert.equal(fs.existsSync('./should-exist.txt'), true)
    assert.equal(fs.existsSync('./should-not-exist.txt'), false)
    assert.equal(fs.existsSync(envs.FILENAME), true)
})
