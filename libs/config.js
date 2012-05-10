var fs = require("fs");
var yaml2js = require("./yaml2js.js")();

var defaultConfig = {
    source: "./src",
    destination: "./target",
    eraseIfExists: false,
    visitors: ["sep"],
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
    // FIXME: change this part to allow no configuration files at all, and just normalize the the default config object
    try {
        var data = fs.readFileSync(configPath, "utf8");
    } catch(e) {
        logger.logError("Could not find configuration file " + configPath);
        return null;
    }

    var jsConfig = yaml2js.toJs(data);
    if(jsConfig) {
        var config = normalize(jsConfig);

        if(Object.keys(config.packages).length === 0) {
            config.packages = {"packman.js": {files: {includes: ["**/*"]}}};
        }

        return config;
    } else {
        return null;
    }
};

module.exports.get = get;
