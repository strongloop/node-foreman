'use strict';

exports.skipWindowsNode10 = skipWindowsNode10;

function skipWindowsNode10() {
  var opts = {};
  if (/win32/.test(process.platform) && /^v0\.10/.test(process.version)) {
    opts.skip = 'test is flaky under node 0.10 on Windows';
  }
  return opts;
}
