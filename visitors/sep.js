function getFileNameExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf("."));
}

module.exports.onPackageStart = function(config, packageFileObject) {
    var ext = getFileNameExtension(packageFileObject.path);

    if(ext === ".js") {
        packageFileObject.content += "// JS Package: " + packageFileObject.path + "\n";
    } else if(ext === ".css") {
        packageFileObject.content += "/* CSS Package: " + packageFileObject.path + " */\n";
    } else {
        packageFileObject.content += "Package: " + packageFileObject.path + "\n";
    }
};

module.exports.onFileStart = function(config, packageFileObject) {
    var ext = getFileNameExtension(packageFileObject.path);

    if(ext === ".js") {
        packageFileObject.content += "\n\n// JS File: " + packageFileObject.currentFile.path + "\n";
    } else if(ext === ".css") {
        packageFileObject.content += "\n\n/* CSS File: " + packageFileObject.currentFile.path + " */\n";
    } else {
        packageFileObject.content += "\n\nFile: " + packageFileObject.currentFile.path + "\n";
    }
};