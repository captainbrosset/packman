var fs = require("fs");
var yaml = require('js-yaml');

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

function transformYamlToJs(yamlText) {
    try {
        return yaml.load(yamlText);
    } catch(e) {
        var msg = "Could not parse the YAML configuration file (";
        msg += e.context + " line " + e.contextMark.line + " column " + e.contextMark.column;
        msg += " : " + e.problem + ")";
        logger.logError(msg);
        return {};
    }
};

function get(configPath) {
    try {
        var data = fs.readFileSync(configPath, "utf8");
        var config = normalize(transformYamlToJs(data));

        if(Object.keys(config.packages).length === 0) {
            config.packages = {"pakman.js": {files: {includes: ["**/*"]}}};
        }

        return config;
    } catch (e) {
        logger.logError("Could not find configuration file " + configPath);
        return null;
    }
};

module.exports.get = get;
