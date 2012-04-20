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

var PackageFile = function(path, content) {
    this.path = path;
    this.content = content;
    this.currentFile = null;
};
var File = function(path, physicalPath, content, packageFile) {
    this.path = path;
    this.physicalPath = physicalPath;
    this.content = content;
    this.packageFile = packageFile;
};

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

    var packageFileObject = new PackageFile(targetFilePath, "");

    vh.runVisitorsOnPhase(vh.phases.onPackageStart, visitors, [config, packageFileObject]);

    for(var i = 0, l = filePaths.length; i < l; i ++) {
        var filePath = filePaths[i];
        var physicalFilePath = getPhysicalPath(filePath, source);
        var fileContent = fs.readFileSync(physicalFilePath, "utf-8");
        var fileObject = new File(filePath, physicalFilePath, fileContent, packageFileObject);

        packageFileObject.currentFile = fileObject;

        vh.runVisitorsOnPhase(vh.phases.onFileStart, visitors, [config, packageFileObject]);

        vh.runVisitorsOnPhase(vh.phases.onFileContent, visitors, [config, fileObject]);

        if(!fileObject.content && verbose) {
            console.warn("\n  !! The visitors generating " + targetFilePath + " did not return any content.");
        }

        packageFileObject.content += fileObject.content;

        vh.runVisitorsOnPhase(vh.phases.onFileEnd, visitors, [config, packageFileObject]);
    }

    vh.runVisitorsOnPhase(vh.phases.onPackageEnd, visitors, [config, packageFileObject]);
    vh.runVisitorsOnPhase(vh.phases.onPackageName, visitors, [config, packageFileObject]);

    var packageContent = packageFileObject.content;
    var packageFileName = getPhysicalPath(packageFileObject.path, destination);

    writeContentToFile(packageFileName, packageContent);

    return packageFileName;
}

/**
 * Run the merge multiple times
 * @param {Object} config Config object telling multiMerge which packages to create and how.
 * @param {Boolean} verbose Output more debug information
 */
function multiMerge(config, verbose) {
    var globalVisitors = vh.getVisitorInstances(config.visitors, verbose);

    var packages = config.packages;

    vh.runVisitorsOnPhase(vh.phases.onStart, globalVisitors, [config]);

    for(var packageName in config.resolvedPackages) {
        var localVisitors = globalVisitors;

        if(config.resolvedPackages[packageName].visitors) {
            localVisitors = vh.getVisitorInstances(config.config.resolvedPackages[packageName].visitors, verbose);
        }

        var files = config.resolvedPackages[packageName].files;

        if(verbose) {
            console.log("\n  + " + packageName);
            for(var i = 0, l = files.length; i < l; i ++) {
                console.log("  | " + files[i]);
            }
        }

        var newPackageName = merge(files, packageName, config.source, config.destination, userPackages, localVisitors, verbose);

        // Updating the original config to replace the package name with the new name
        config.packages[newPackageName] = config.packages[packageName];
        delete config.packages[packageName];
        config.resolvedPackages[newPackageName] = config.resolvedPackages[packageName];
        delete config.resolvedPackages[packageName];

        console.log("  >>> Package " + newPackageName + " created!");
    }

    vh.runVisitorsOnPhase(vh.phases.onEnd, globalVisitors, [config]);
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
