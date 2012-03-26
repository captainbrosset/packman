var wrench = require('wrench');

module.exports.prepare = function(destination) {
	wrench.rmdirSyncRecursive(destination, true);
	wrench.mkdirSyncRecursive(destination, 0777);
};