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
	try {
		var data = fs.readFileSync(configPath, "utf8");
		var config = {};

		try {
			config = normalize(JSON.parse(data));
		} catch(configReadingError) {
			config = normalize({});
		}

		return config;
	} catch (e) {
		logger.logError("Could not find configuration file " + configPath);
		logger.logDebug(e);
		return null;
	}
};

module.exports.get = get;
