var md5 = require("./md5.js");
var jsmin = require("./jsmin.js");


module.exports.onFileContent = function(fileName, fileContent, config) {
    if(config.jsmin && fileName.substring(fileName.lastIndexOf(".")) === ".js") {
        return jsmin.getMinifiedContent(fileContent, config.mangle);
    } else {
        return fileContent;
    }
};

module.exports.onPackageStart = function(fileName, config) {
    return "// Package: " + fileName + "\n";
};

module.exports.onPackageEnd = function(fileName, config) {
    return "";
};

module.exports.onFileStart = function(fileName, packageFileName, config) {
    return "\n\n// File: " + fileName + "\n\n";
};

module.exports.onFileEnd = function(fileName, packageFileName, config) {
    return "";
};

module.exports.onPackageName = function(fileName, fileContent, config) {
    if(config.md5) {
        return md5.versionContent(fileName, fileContent);
    } else {
        return fileName;
    }
};
