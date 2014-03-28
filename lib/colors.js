var reset = '\x1B[0m';
var colors = {
  black:           '\x1B[30m',
  red:             '\x1B[31m',
  green:           '\x1B[32m',
  yellow:          '\x1B[33m',
  blue:            '\x1B[34m',
  magenta:         '\x1B[35m',
  cyan:            '\x1B[36m',
  white:           '\x1B[37m',
  bright_black:    '\x1B[30m',
  bright_red:      '\x1B[31m',
  bright_green:    '\x1B[32m',
  bright_yellow:   '\x1B[33m',
  bright_blue:     '\x1B[34m',
  bright_magenta:  '\x1B[35m',
  bright_cyan:     '\x1B[36m',
  bright_white:    '\x1B[37m',
}

function identity(self) {
  return self
}

function colorizer(color) {
  if (process.stdout.isTTY) {
    return function (str) {
      return colors[color] + str + reset;
    }
  } else {
    return identity
  }
}

module.exports.colors = [];

[
  "cyan", "yellow","green",
  "magenta","red","blue",
  "bright_cyan","bright_yellow","bright_green",
  "bright_magenta","bright_red","bright_blue"
].forEach(function(name) {
  var colorFn = colorizer(name);
  module.exports[name] = colorFn;
  module.exports.colors.push(colorFn);
});

module.exports.colors_max = module.exports.colors.length;
