require('colors')

var colors_max = 8;
var colors = [
    function(x){return x.cyan},
    function(x){return x.yellow},
    function(x){return x.green},
    function(x){return x.magenta},
    function(x){return x.blue},
    function(x){return x.white},
	function(x){return x.red},
	function(x){return x.grey}
];

module.exports.colors_max = colors_max
module.exports.colors     = colors