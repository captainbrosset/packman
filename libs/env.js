var wrench = require('wrench');
var fs = require("fs");

/**
 * Make sure the destination directory is there for files to be generated into.
 * @param {String} destination The target directory to check for
 * @param {Boolean} eraseIfExists If a directory (or file) is found at the same place, erase it and recreate it
 * @return {Boolean} Returns true if the directory is ready (either it was already here, or it's been created). False if eraseIfExists is false and a file (not a folder) with the same path was found.
 */
module.exports.prepare = function(destination, eraseIfExists) {
  var isFolder = false,
    exists = false;

  try {
    var stats = fs.lstatSync(destination);
    exists = true;
    if(stats.isDirectory()) {
      isFolder = true;
    }
  } catch(e) {}

  if(exists) {
    if(eraseIfExists) {
      wrench.rmdirSyncRecursive(destination, true);
      wrench.mkdirSyncRecursive(destination, 0777);
      return true;
    } else {
      if(isFolder) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    wrench.mkdirSyncRecursive(destination, 0777);
    return true;
  }
};