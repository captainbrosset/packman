var coffee = require("coffee-script");

function getFileNameExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf("."));
}

function getFileNameName(fileName) {
    return fileName.substring(0, fileName.lastIndexOf("."));
}

module.exports.onFileContent = function(callback, config, fileObject) {
    if(getFileNameExtension(fileObject.path) === ".coffee") {
        fileObject.content = coffee.compile(fileObject.content);
        fileObject.path = getFileNameName + ".js";
    }
    callback();
};
