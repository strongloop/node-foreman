var fs   = require('fs')
var cons = require('./console').Console

function method(name) {
  return function(o) {
    return o[name].apply(o)
  }
}

// Parse a Key=Value File Containing Environmental Variables
function KeyValue(data) {
  var env = {};

  data.toString().replace(/^\s*\#.*$/gm,'')
                 .replace(/^\s*$/gm,'')
                 .split(/\n/)
                 .map(method('trim'))
                 .filter(notBlank)
                 .forEach(capturePair)
  return env

  function notBlank(str) {
    return str.length > 2
  }

  function capturePair(line) {
    var pair = line.split('=');
    var key = pair[0].trim();
    var rawVal = pair.slice(1).join('=').trim();
    env[key] = parseValue(rawVal);
  }

  function parseValue(val) {
    switch (val[0]) {
      case '"': return /^"([^"]*)"/.exec(val)[1];
      case "'": return /^'([^']*)'/.exec(val)[1];
      default : return val.replace(/\s*\#.*$/, '');
    }
  }
}

// Given:
/*
{
  "top": {
    "middle": {
      "bottom": "value"
    },
    "other": [ "zero", "one", "two" ]
  },
  "last": 42
}
*/
// Get:
/*
{
  "TOP_MIDDLE_BOTTOM": "value",
  "TOP_OTHER_0": "zero",
  "TOP_OTHER_1": "one",
  "TOP_OTHER_2": "two",
  "LAST": 42
}
*/
// Flatten nested object structure
function flattenJSON(json) {
  var flattened = {}

  walk(json, function(path, item) {
    flattened[path.join('_').toUpperCase()] = item
  })

  return flattened

  function walk(obj, visitor, path) {
    var item
    path = path || []
    for (key in obj) {
      item = obj[key]
      if (typeof item == 'object') {
        walk(item, visitor, path.concat(key))
      } else {
        visitor(path.concat(key), item)
      }
    }
  }
}


// Given a standard dictionary:
/*
{
  "TOP_MIDDLE_BOTTOM": "value",
  "TOP_OTHER_0": "zero",
  "TOP_OTHER_1": "one",
  "TOP_OTHER_2": "two",
  "LAST": 42
}
*/
// Return a key=value pair document
/*
TOP_MIDDLE_BOTTOM=value
TOP_OTHER_0=zero
TOP_OTHER_1=one
TOP_OTHER_2=two
LAST=42
*/
function dumpEnv(conf) {
  var output = []
  for (key in conf) {
    output.push(key + '=' + conf[key])
  }
  return output.join('\n') + '\n'
}

// Loads a file as either a .env format or JSON format and returns it as a
// simplified dictionary
function loadEnvs(path){
  var env, data

  if (!fs.existsSync(path)) {
    cons.Warn("No ENV file found")
    env = {}
  } else {
    data = fs.readFileSync(path);
    try {
	    var envs_json = JSON.parse(data)
      env = flattenJSON(envs_json,"",{});
		  cons.Alert("Loaded ENV %s File as JSON Format",path);
    } catch (e) {
      env = KeyValue(data);
      cons.Alert("Loaded ENV %s File as KEY=VALUE Format",path);
    }
  }
  env.PATH = env.PATH || process.env.PATH;
  return env;
}

module.exports.loadEnvs = loadEnvs
module.exports.flattenJSON = flattenJSON
module.exports.KeyValue = KeyValue
module.exports.dumpEnv  = dumpEnv
