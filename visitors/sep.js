function getFileNameExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf("."));
}

module.exports.onPackageStart = function(packageFileName, config, userPackages) {
    var ext = getFileNameExtension(packageFileName);

    if(ext === ".js") {
        return "// JS Package: " + packageFileName + "\n";
    } else if(ext === ".css") {
        return "/* CSS Package: " + packageFileName + " */\n";
    } else {
        return "Package: " + packageFileName + "\n";
    }
};

module.exports.onFileStart = function(fileName, packageFileName, config, userPackages) {
    var ext = getFileNameExtension(packageFileName);
    
    if(ext === ".js") {
        return "\n\n// JS File: " + fileName + "\n";
    } else if(ext === ".css") {
        return "\n\n/* CSS File: " + fileName + " */\n";
    } else {
        return "\n\nFile: " + fileName + "\n";
    }
};