var assert = require('chai').assert
  , util = require('util')
  , Console = require('../lib/console')

var logs = { log: [], warn: [], error: [] }
  , logger = { log: makeLogger(logs.log)
             , warn: makeLogger(logs.warn)
             , error: makeLogger(logs.error)
             }

var c = new Console(logger)
resetLogs()

assert.equal(logs.log.length, 0)
assert.equal(logs.warn.length, 0)
assert.equal(logs.error.length, 0)

resetLogs()
c.Alert('ze message')
assertLogged('log', /\[OKAY\]/)
assertLogged('log', /ze message/)

resetLogs()
c.Done('ze message')
assertLogged('log', /\[DONE\]/)
assertLogged('log', /ze message/)

resetLogs()
c.Warn('ze warning')
assertLogged('warn', /\[WARN\]/)
assertLogged('warn', /ze warning/)

resetLogs()
c.Error('such an error')
assertLogged('error', /\[FAIL\]/)
assertLogged('error', /such an error/)

assert.lengthOf(c.trim('a very long string this is!', 5), 6)

function makeLogger(collector) {
  return function() {
    collector.push(util.format.apply(util, arguments))
  }
}

function resetLogs() {
  logs.log.splice(0, logs.log.length)
  logs.warn.splice(0, logs.warn.length)
  logs.error.splice(0, logs.error.length)
}

function assertLogged(logName, pattern) {
  var actual = logs[logName][logs[logName].length - 1]

  Object.keys(logs).forEach(function (log) {
    assert.lengthOf(logs[log], logName === log ? 1 : 0)
  })

  assert.match(actual, pattern)
}
