function parseRequirements(req) {
  var requirements = {};
  req.toString().split(',').forEach(function(item) {
    var tup = item.trim().split('=');
    var key = tup[0];
    var val;
    if(tup.length > 1) {
      val = parseInt(tup[1]);
    } else {
      val = 1;
    }

    requirements[key] = val;
  });
  return requirements;
}

function getreqs(args, proc) {
  var req;
  if(args && args.length > 0) {
    // Run Specific Procs
    req = parseRequirements(args);
  } else {
    // All
    req = {};
    for(var key in proc){
      req[key] = 1;
    }
  }
  return req;
}

function calculatePadding(reqs) {
  var padding = 0;
  for(var key in reqs){
    var num = reqs[key];
    var len = key.length + num.toString().length;
    if(len > padding) {
      padding = len;
    }
  }
  return padding + 12;
}

module.exports.calculatePadding  = calculatePadding;
module.exports.getreqs           = getreqs;
