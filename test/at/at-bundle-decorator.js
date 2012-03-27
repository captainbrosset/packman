module.exports.onFileContent = function(fileName, fileContent, config, userPackages) {
    // If JS, minify it
    // If tpl/tpl.css/tml/txt, compile it
};

module.exports.onPackageStart = function(fileName, config, userPackages) {
    // Add MULTIFILE header
    // Add License
};

module.exports.onFileStart = function(fileName, packageFileName, config, userPackages) {
    // Add Separator
};

module.exports.onPackageName = function(fileName, fileContent, config, userPackages) {
    // md5
};
