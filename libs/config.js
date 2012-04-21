var fs = require("fs");

var defaultConfig = {
	source: "./",
	destination: "./",
    eraseIfExists: false,
	visitors: ["./visitors/sep.js"],
	packages: {},
    resolvedPackages: {}
};

function normalize(config, ref) {
	var normalizedConfig = config;
	ref = ref || defaultConfig;
	for(var property in ref) {
		if(typeof normalizedConfig[property] === "undefined") {
			normalizedConfig[property] = ref[property];
 		} else if(typeof normalizedConfig[property] === "object") {
 			normalize(normalizedConfig[property], ref[property]);
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