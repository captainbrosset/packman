var jsmin = require("../jsmin.js");

function getFileNameExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf("."));
}

module.exports.onFileContent = function(config, fileObject) {
    if(getFileNameExtension(fileObject.path) === ".js") {
        fileObject.content = jsmin.getMinifiedContent(fileObject.content, true) + ";";
    }
};
