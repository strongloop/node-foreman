var reset = '\x1B[0m';
var colors = {
  magenta:         '\x1B[35m',
  blue:            '\x1B[34m',
  cyan:            '\x1B[36m',
  green:           '\x1B[32m',
  yellow:          '\x1B[33m',
  red:             '\x1B[31m',
  bright_magenta:  '\x1B[35m',
  bright_cyan:     '\x1B[36m',
  bright_blue:     '\x1B[34m',
  bright_green:    '\x1B[32m',
  bright_yellow:   '\x1B[33m',
  bright_red:      '\x1B[31m',
};

function identity(self) {
  return self;
}

function colorizer(color) {
  if (process.stdout.isTTY) {
    return function (str) {
      return colors[color] + str + reset;
    };
  } else {
    return identity;
  }
}

module.exports.colors = [];

var colorKeys = Object.keys(colors);
colorKeys.forEach(function(name) {
  var colorFn = colorizer(name);
  module.exports[name] = colorFn;
  module.exports.colors.push(colorFn);
});

module.exports.colors_max = module.exports.colors.length;
