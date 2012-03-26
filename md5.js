var crypto = require("crypto");
var fs = require("fs-extra");
var util = require("util");


function hashContent(content) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(content);
    return md5sum.digest('hex');
};

function getNewFileName(dir, fileName, md5, extension, pattern) {
    return dir + pattern.replace("[name]", fileName).replace("[md5]", md5).replace("[extension]", extension);
}

function prepareTargetDir(targetDir, sourceDir) {
    targetDir = targetDir || sourceDir;
    if(targetDir.substring(targetDir.length - 1) !== "/") {
        targetDir += "/";
    }
    return targetDir;
}

function versionContent(filePath, content, targetDir, pattern) {
    if(filePath.indexOf("/") === -1) {
        filePath = "./" + filePath;
    }

    var sourceDir = filePath.substring(0, filePath.lastIndexOf("/") + 1);
    var fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    var bareFileName = fileName.substring(0, fileName.lastIndexOf("."));
    var extension = fileName.substring(fileName.lastIndexOf(".") + 1);

    targetDir = prepareTargetDir(targetDir, sourceDir);
    pattern = pattern || "[name]-[md5].[extension]";

    var md5 = hashContent(content);

    return getNewFileName(targetDir, bareFileName, md5, extension, pattern);
}

/**
 * Create a new versioned copy of the file path as argument
 * @param {String} filePath The complete path to the file
 * @param {String} targetDir [Optional] If passed, the file will be copied to this target dir. Default to the dir of the source file
 * @param {String} pattern [Optional] A pattern to know how to name the file, by default will be named fileName-md5.js (use [name], [md5] and [extension] placeholders in the pattern, e.g. [name]-[md5].[extension])
 */
function versionFile(filePath, targetDir, pattern) {
    var content = fs.readFileSync(filePath);
    var newFilePath = versionContent(filePath, content, targetDir, pattern);

    try {
        // https://github.com/jprichardson/node-fs-extra
        // FIXME: weird issue on windows: "Error: UNKNOWN, unknown error"
        // Triggered by readSync in fs module, however, doesn't seem to be causing a problem, so, for now, just try/catching
        fs.copyFileSync(filePath, newFilePath);
    } catch(e) {}

    return newFilePath;
};


if (!module.parent) {
    var DEFAULT_TARGET = "where the source is";

    var argv = require('optimist')
        .usage('Version a file using the MD5 hash.\nUsage: $0 -s path/to/myFile.js')
        .demand('s')
        .alias('s', 'source')
        .describe('s', 'Path to the file to be versioned')
        .default('t', DEFAULT_TARGET)
        .alias('t', 'target')
        .describe('t', 'Target directory to save the file to')
        .default('p', "[name]-[md5].[extension]")
        .alias('p', 'pattern')
        .describe('p', 'Destination file pattern (use [name], [md5] and [extension])')
        .argv
    ;

    var sourceFilePath = argv.s;
    var targetDir = argv.t === DEFAULT_TARGET ? false : targetDir;
    var pattern = argv.p;

    var newFilePath = versionFile(sourceFilePath);

    console.log("File " + newFilePath + " created!");

} else {
    module.exports.versionFile = versionFile;
    module.exports.versionContent = versionContent;
}