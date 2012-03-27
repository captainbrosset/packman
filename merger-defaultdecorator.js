var md5 = require("./md5.js");
var jsmin = require("./jsmin.js");


module.exports.onFileContent = function(fileName, fileContent, config, userPackages) {
    if(config.jsmin && fileName.substring(fileName.lastIndexOf(".")) === ".js") {
        return jsmin.getMinifiedContent(fileContent, config.mangle);
    } else {
        return fileContent;
    }
};

module.exports.onPackageStart = function(fileName, config, userPackages) {
    return "// Package: " + fileName + "\n";
};

module.exports.onPackageEnd = function(fileName, config, userPackages) {
    return "";
};

module.exports.onFileStart = function(fileName, packageFileName, config, userPackages) {
    return "\n\n// File: " + fileName + "\n";
};

module.exports.onFileEnd = function(fileName, packageFileName, config, userPackages) {
    return "";
};

module.exports.onPackageName = function(fileName, fileContent, config, userPackages) {
    if(config.md5) {
        return md5.versionContent(fileName, fileContent);
    } else {
        return fileName;
    }
};
