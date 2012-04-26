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
    // * are a special char in YAML, so auto-escape them
    yamlText = yamlText.replace(/\*/g, "\\*");
    try {
        // Then revert them back to * in the JSON
        var jsText = JSON.stringify(yaml.load(yamlText));
        return JSON.parse(jsText.replace(/\\/g, ""));
    } catch(e) {
        logger.logError("Could not parse the YAML configuration file", e);
        return {};
    }
}

function get(configPath) {
    try {
        var data = fs.readFileSync(configPath, "utf8");
        return normalize(transformYamlToJs(data));
    } catch (e) {
        logger.logError("Could not find configuration file " + configPath);
        logger.logDebug(e);
        return null;
    }
};

module.exports.get = get;
