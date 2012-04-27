/**
 * Minify JavaScript code.
 * This uses uglify-js from https://github.com/mishoo/UglifyJS
 * and therefore proposes the option to "mangle" names as well (obfuscate).
 */

var parser = require("uglify-js").parser;
var minifier = require("uglify-js").uglify;
var fs = require("fs");

function getMinifiedContent(content, path, mangle) {
    try {
        var ast = parser.parse(content);
        if(mangle) {
            ast = minifier.ast_mangle(ast);
        }
        ast = minifier.ast_squeeze(ast);
        return minifier.gen_code(ast);
    } catch(e) {
        logger.logError("Could not minify file " + path);
        logger.logDebug(e.message);
        return content;
    }
}

function getFileNameExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf("."));
}

module.exports.onFileContent = function(callback, config, fileObject) {
    if(getFileNameExtension(fileObject.path) === ".js") {
        fileObject.content = getMinifiedContent(fileObject.content, fileObject.path, true) + ";";
    }
    callback();
};
