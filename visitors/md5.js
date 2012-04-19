var md5 = require("../md5.js");

module.exports.onPackageName = function(fileName, fileContent, config, userPackages) {
    return md5.getVersionedFileName(fileName, fileContent);
};
