var jsmin = require("../jsmin.js");

module.exports.onFileContent = function(fileName, fileContent, userPackages) {
    if(fileName.substring(fileName.lastIndexOf(".")) === ".js") {
        return jsmin.getMinifiedContent(fileContent, true);
    } else {
        return fileContent;
    }
};

// TODO: find a way to normalize the arguments passed to visitors
// Should always be some common args: main config object, resolved/unresolved userPackages, and then some specific stuff