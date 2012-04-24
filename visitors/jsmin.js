/**
 * Minify JavaScript code.
 * This uses uglify-js from https://github.com/mishoo/UglifyJS
 * and therefore proposes the option to "mangle" names as well (obfuscate).
 */

var parser = require("uglify-js").parser;
var minifier = require("uglify-js").uglify;
var fs = require("fs");

/**
 * Minify the given JavaScript content
 * @param {String} content The content to minfy
 * @param {Boolean} mangle [Optional] Mangle variable names where possible, defaults to false
 * @return {String} The minified JavaScript content
 */
function getMinifiedContent(content, mangle) {
    var ast = parser.parse(content);
    if(mangle) {
        ast = minifier.ast_mangle(ast);
    }
    ast = minifier.ast_squeeze(ast);
    return minifier.gen_code(ast);
}

function getFileNameExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf("."));
}

module.exports.onFileContent = function(callback, config, fileObject) {
    if(getFileNameExtension(fileObject.path) === ".js") {
        fileObject.content = getMinifiedContent(fileObject.content, true) + ";";
    }
    callback();
};
