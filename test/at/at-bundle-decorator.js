var licenseText = "";

module.exports.onMultiMergeStart = function(multiMergeConfig, userPackages) {
    // Retrieve the license text and keep it for insertion in every file
};

module.exports.onPackageStart = function(fileName, config, userPackages) {
    return licenseText + "\n//***MULTI-PART";
};

module.exports.onFileStart = function(fileName, packageFileName, config, userPackages) {
	var uniqueSeparator = "\n//:::::::::::::\n";
    return uniqueSeparator + "//LOGICAL-PATH:" + fileName + uniqueSeparator;
};

module.exports.onFileContent = function(fileName, fileContent, config, userPackages) {
    // If JS, minify it
    // If tpl/tpl.css/tml/txt, compile it
};

module.exports.onPackageName = function(fileName, fileContent, config, userPackages) {
    // md5
};
