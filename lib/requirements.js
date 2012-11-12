function parseRequirements(req){
    var requirements = {};
    req.toString().split(',').forEach(function(item){
        var tup = item.trim().split('=');
        var key = tup[0];
        var val;
        if(tup.length>1){
            val = parseInt(tup[1]);
        }else{
            val = 1;
        }
        
        requirements[key] = val;
    });
    return requirements;
}

function getreqs(args,proc){
    var req;
    if(args && args.length>0){
        // Run Specific Procs
        req = parseRequirements(args);
    }else{
        // All
        req = {};
        for(key in proc){
            req[key] = 1;
        }
    }
    return req;
}

module.exports.getreqs           = getreqs
module.exports.parseRequirements = parseRequirements
