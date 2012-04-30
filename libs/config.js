var fs = require("fs");
var yaml = require('js-yaml');

var defaultConfig = {
    source: "./",
    destination: "./",
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

function transformYamlToJs(yamlText) {
    try {
        return yaml.load(yamlText);
    } catch(e) {
        var msg = "Could not parse the YAML configuration file (";
        if(e.context && e.contextMark) {
            msg += e.context + " line " + e.contextMark.line + " column " + e.contextMark.column;
        }
        if(e.problemMark) {
            msg += "line " + e.problemMark.line + " column " + e.problemMark.column;
        }
        msg += " : " + e.problem + ")";
        logger.logError(msg);
        return null;
    }
};

function get(configPath) {
    try {
        var data = fs.readFileSync(configPath, "utf8");
        var jsConfig = transformYamlToJs(data);
        if(jsConfig) {
            var config = normalize(jsConfig);

            if(Object.keys(config.packages).length === 0) {
                config.packages = {"packman.js": {files: {includes: ["**/*"]}}};
            }

            return config;
        } else {
            return null;
        }
    } catch (e) {
        logger.logError("Could not find configuration file " + configPath);
        return null;
    }
};

module.exports.get = get;
