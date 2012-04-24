var less = require('less');

function getFileNameExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf("."));
}

module.exports.onFileContent = function(callback, config, fileObject) {
    if(getFileNameExtension(fileObject.path) === ".less") {
        less.render(fileObject.content, function (e, css) {
            fileObject.content = css;
            callback();
        });
    } else {
        callback();
    }
};
