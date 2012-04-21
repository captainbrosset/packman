var md5 = require("../md5.js");

module.exports.onPackageName = function(config, packageFileObject) {
    packageFileObject.path = md5.getVersionedFileName(packageFileObject.path, packageFileObject.content);
};
