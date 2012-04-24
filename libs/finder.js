var fs = require("fs");


function walkDir(directory, handler, originalDirectory) {
    var files = fs.readdirSync(directory);
    for(var i = 0, l = files.length; i < l; i ++) {
        var fullFilePath = directory + "/" + files[i];
        var stats = fs.statSync(fullFilePath);
        if(stats.isFile()) {
            if(originalDirectory) {
                handler(fullFilePath.substring(originalDirectory.length + 1));
            } else {
                handler(fullFilePath.substring(directory.length + 1));
            }
        } else if(stats.isDirectory()) {
            walkDir(fullFilePath, handler, originalDirectory || directory);
        }
    }
}

function getAllSourceFiles(directory) {
    var sourceFiles = [];
    walkDir(directory, function(filePath) {
        sourceFiles.push(filePath);
    });
    return sourceFiles;
}

module.exports.getAllSourceFiles = getAllSourceFiles;
