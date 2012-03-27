module.exports.onPackageStart = function(fileName, config, userPackages) {
    // add license text
    return "\n";
};

module.exports.onFileStart = function(fileName, packageFileName, config, userPackages) {
    return "\n";
};

module.exports.onPackageName = function(fileName, fileContent, config, userPackages) {
    var name = fileName.substring(0, fileName.lastIndexOf("."));
    return name + "-" + config.version + ".js";
};