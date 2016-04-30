var tap = require('tap');
var requirements = require('../lib/requirements');

tap.test('parsing', function(t) {
  t.test('empty', function(t) {
    var args = [];
    var procs = {};
    var reqs = requirements.getreqs(args, procs);
    t.deepEqual(reqs, {});
    t.end();
  });
  t.test('simple', function(t) {
    var args = ['web=1,api=2,log=1'];
    var procs = {web: 'node web', api: 'node api', log: 'node log'};
    var reqs = requirements.getreqs(args, procs);
    t.deepEqual(reqs, {web: 1, api: 2, log: 1});
    t.end();
  });
  t.end();
});

tap.test('padding', function(t) {
  t.test('empty', function(t) {
    var reqs = {};
    var padding = requirements.calculatePadding(reqs);
    t.equal(padding, 12);
    t.end();    
  });
  t.test('empty', function(t) {
    var reqs = {
      web: 1,
      api: 2,
      log: 1,
    };
    var padding = requirements.calculatePadding(reqs);
    t.equal(padding, 16);
    t.end();    
  });
  t.end();
});
