module.exports.onFileStart = function(callback, config, packageFileObject) {
  packageFileObject.content += 'file ' + packageFileObject.currentFile.path + ' starts here: ';
  callback();
};

module.exports.onFileEnd = function(callback, config, packageFileObject) {
  packageFileObject.content += 'file ' + packageFileObject.currentFile.path + ' ends here\n';
  callback();
};