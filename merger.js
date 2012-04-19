/**
 * Merge text files together.
 * This is particularly useful for website static resources to reduce the number of http requests to download files.
 * The merger can retrieve and lists files to be merged, and then delegate to a series of "visitors" to take care of processing
 * files before they are merged, or insert separators between them.
 */

var fs = require("fs");
var wrench = require("wrench");
var vh = require("./libs/visitorshandler.js");


function getParentDirectoryPath(file) {
    return file.substring(0, file.lastIndexOf("/"));
}

function writeContentToFile(file, content) {
    if(content) {
        if(file.indexOf("/") === -1) {
            file = "./" + file;
        }
        wrench.mkdirSyncRecursive(getParentDirectoryPath(file), 0777);
        var fd = fs.openSync(file, "w");
        fs.writeSync(fd, content);
        fs.closeSync(fd);
    }
}

function getPhysicalPath(logicalPath, directory) {
    if(directory.substring(directory.length - 1) !== "/") {
        directory += "/";
    }

    if(logicalPath.substring(0, 1) == "/") {
        return directory + logicalPath.substring(1);
    }
    if(logicalPath.substring(0, 2) == "./") {
        return directory + logicalPath.substring(2);
    }
    return directory + logicalPath;
}

/**
 * Merge a series of files into one package file
 * @param {Array} filePaths An array of strings, each one representing the complete path to a file to be merged
 * @param {String} targetFilePath The target file path/name. The name/path can be altered depending on the visitor
 * @param {String} source [Optional] The base source folder to read files from. Defaults to ./
 * @param {String} destination [Optional] The base destination folder to write package files to. Defaults to ./
 * @param {Object} userPackages The original packages list, as configured by the user, with un-resolved paths
 * @param {Object} visitors [Optional] The list of visitors to run for this package.
 * @param {Boolean} verbose [Optional] Whether to output debug info
 * @return {String} The target file name that was created
 */
function merge(filePaths, targetFilePath, source, destination, userPackages, visitors, verbose) {
    source = source || "./";
    destination = destination || "./";

    var mergedFileContent = "";

    mergedFileContent += vh.runVisitorsOnPhase(vh.phases.onPackageStart, visitors, [targetFilePath, userPackages]);

    for(var i = 0, l = filePaths.length; i < l; i ++) {
        var filePath = filePaths[i];
        var physicalFilePath = getPhysicalPath(filePath, source);

        mergedFileContent += vh.runVisitorsOnPhase(vh.phases.onFileStart, visitors, [filePath, targetFilePath, userPackages]);

        var fileContent = fs.readFileSync(physicalFilePath, "utf-8");
        fileContent += vh.runVisitorsOnPhase(vh.phases.onFileContent, visitors, [filePath, fileContent, userPackages], fileContent);

        if(!fileContent && verbose) {
            console.warn("\n  !! The custom visitor generating " + targetFilePath + " needs to return a string from onFileContent().");
        }

        mergedFileContent += fileContent;
        mergedFileContent += vh.runVisitorsOnPhase(vh.phases.onFileEnd, visitors, [filePath, targetFilePath, userPackages]);
    }

    mergedFileContent += vh.runVisitorsOnPhase(vh.phases.onPackageEnd, visitors, [targetFilePath, userPackages]);

    var newTargetFilePath = vh.runVisitorsOnPhase(vh.phases.onPackageName, visitors, [targetFilePath, mergedFileContent, userPackages], targetFilePath);
    if(!newTargetFilePath) {
        newTargetFilePath = targetFilePath;
        if(verbose) {
            console.warn("\n  !! The custom visitor generating " + targetFilePath + " needs to return a string from onPackageName(). Default name chosen.");
        }
    }

    var physicalPackageFilePath = getPhysicalPath(newTargetFilePath, destination);

    writeContentToFile(physicalPackageFilePath, mergedFileContent);

    return newTargetFilePath;
}

/**
 * Run the merge multiple times
 * @param {Object} config The only parameter is a config object telling multiMerge which packages to create and how.
 * Example usage:
 * <pre>
 * multiMerge({
 *   config: {
 *     jsmin: true,
 *     md5: true
 *   },
 *   visitor: "myVisitorModule.js",
 *   packages: {
 *     "myPackage1.js": {
 *       visitor: "localVisitorModule.js",
 *       config: {},
 *       files: [
 *         "file1.js",
 *         "file2.js"
 *       ]
 *     }
 *   }
 * });
 * </pre>
 * Config can be passed globally, but also for each package (first to be used is local, then global, then default)
 * The same applies for visitors.
 * @param {Object} userPackages The original packages list, as configured by the user, with un-resolved paths
 * @param {Boolean} verbose Output more debug information
 */
function multiMerge(config, userPackages, verbose) {
    var globalVisitors = vh.getVisitorInstances(config.visitors, verbose);

    var packages = config.packages;

    vh.runVisitorsOnPhase(vh.phases.onMultiMergeStart, globalVisitors, [config, userPackages]);

    for(var packageName in packages) {
        var localVisitors = globalVisitors;

        if(packages[packageName].visitors) {
            localVisitors = vh.getVisitorInstances(packages[packageName].visitors, verbose);
        }

        var files = packages[packageName].files;

        if(verbose) {
            console.log("\n  + " + packageName);
            for(var i = 0, l = files.length; i < l; i ++) {
                console.log("  | " + files[i]);
            }
        }

        var newPackageName = merge(files, packageName, config.source, config.destination, userPackages, localVisitors, verbose);

        userPackages[newPackageName] = userPackages[packageName];
        delete userPackages[packageName];

        console.log("  >>> Package " + newPackageName + " created!");
    }

    globalVisitor.onMultiMergeEnd(config, userPackages);
}


if(!module.parent) {

    var argv = require('optimist')
        .usage('Merge file together.\nUsage: $0 -f file1.js file2.js file3.js -t pack.js')
        .demand('f')
        .alias('f', 'files')
        .describe('f', 'List of files to be packaged')
        .demand('t')
        .alias('t', 'target')
        .describe('t', 'Target package file (name will be changed if md5 is passed')
        .argv
    ;

    var files = [argv.f];
    for(var i = 0, l = argv._.length; i < l; i ++) {
        files.push(argv._[i]);
    }

    console.log("Merging files " + files);

    var userPackages = {};
    userPackages[argv.t] = {"files": files};

    var newFileName = merge(files, argv.t, null, null, userPackages);

    console.log("Package file " + newFileName + " created!");

} else {
    module.exports.merge = merge;
    module.exports.multiMerge = multiMerge;
}
