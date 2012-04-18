module.exports.onPackageStart = function(fileName, config, userPackages) {
    return "// " + fileName + "\n";
};

module.exports.onFileStart = function(fileName, packageFileName, config, userPackages) {
    return "\n";
};

module.exports.onFileEnd = function(fileName, packageFileName, config, userPackages) {
    // Needed because otherwise, when packing another file after this, starting with a self executing function will break the JS
    return ";";
};

module.exports.onPackageName = function(fileName, fileContent, config, userPackages) {
    var name = fileName.substring(0, fileName.lastIndexOf("."));
    return name + "-" + config.version + ".js";
};