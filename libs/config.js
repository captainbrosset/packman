var fs = require("fs");

var defaultConfig = {
	config: {
		jsmin: true,
		mangle: false,
		md5: true
	},
	source: "./",
	destination: "./",
	decorator: "./merger-defaultdecorator.js",
	packages: {}
};

function normalize(config, ref) {
	var normalizedConfig = config;
	ref = ref || defaultConfig;
	for(var i in ref) {
		if(typeof normalizedConfig[i] === "undefined") {
			normalizedConfig[i] = ref[i];
 		} else if(typeof normalizedConfig[i] === "object") {
 			normalize(normalizedConfig[i], ref[i]);
 		}
 	}
	return normalizedConfig;
};

function get(configPath) {
	var data = fs.readFileSync(configPath, "utf8"), config = {};

	try {
		config = normalize(JSON.parse(data));
	} catch(configReadingError) {
		config = normalize({});
	}

	return config;
};


if(!module.parent) {

    var argv = require('optimist')
        .usage('Normalize a config file.\nUsage: $0 -c path/to/myConfig.js')
        .demand('c')
        .alias('c', 'config')
        .argv
    ;

    console.log(get(argv.c));

} else {
	module.exports.get = get;
}