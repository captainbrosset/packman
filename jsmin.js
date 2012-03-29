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

function getMinFileName(fileName) {
    return fileName.substring(0, fileName.lastIndexOf(".")) + "-min" + fileName.substring(fileName.lastIndexOf("."));
}

/**
 * Minify a file on the disk
 * @param {String} source The complete file path to the file to be minified
 * @param {Boolean} mangle [Optional] Mangle variable names where possible, defaults to false
 * @param {String} destination [Optional] Used to know where the minified file should be saved
 * (defaults to originalFileName-min.js).
 * @param {String} The destination file name that has been written
 */
function minifyFile(source, mangle, destination) {
    destination = destination || getMinFileName(source);
    var content = fs.readFileSync(source, "utf8");
    var minContent = getMinifiedContent(content, mangle);

    var fileDescriptor = fs.openSync(destination, "w");
    fs.writeSync(fileDescriptor, minContent);
    fs.closeSync(fileDescriptor);

    return destination;
}


if(!module.parent) {

    var argv = require('optimist')
        .usage('Minify a JavaScript file.\nUsage: $0 -s path/to/myFile.js -m')
        .demand('s')
        .alias('s', 'source')
        .describe('s', 'Path to the file to be minified')
        .boolean('m')
        .alias('m', 'mangle')
        .describe('m', 'Mangle variable names')
        .argv
    ;

    var newFileName = minifyFile(argv.s, argv.m);

    console.log("Minified file " + newFileName + " saved!");

} else {
    module.exports.getMinifiedContent = getMinifiedContent;
    module.exports.minifyFile = minifyFile;
}
