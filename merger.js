/**
 * Merge text files together.
 * This is particularly useful for website static resources to reduce the number of http requests to download files.
 * The merger can retrieve and lists files to be merged, and then delegate to a series of "visitors" to take care of processing
 * files before they are merged, or insert separators between them.
 */

var fs = require("fs");
var vh = require("./libs/visitorshandler.js");
var fu = require("./libs/fileutils.js");
var sequence = require("./libs/sequencer.js").sequence;


/**
 * PackageFile object representation to be given to visitors
 */
var PackageFile = function(path, content) {
    this.path = path;
    this.content = content;
    this.currentFile = null;
};

/**
 * Single text file object representation to be given to visitors
 */
var File = function(path, physicalPath, content, packageFile) {
    this.path = path;
    this.physicalPath = physicalPath;
    this.content = content;
    this.packageFile = packageFile;
};

function mergeOneFile(filePath, sourceDir, packageFileObject, config, visitors, callback) {
    var physicalFilePath = fu.getPhysicalPath(filePath, sourceDir);
    var fileContent = fs.readFileSync(physicalFilePath, "utf-8");
    var fileObject = new File(filePath, physicalFilePath, fileContent, packageFileObject);

    packageFileObject.currentFile = fileObject;

    vh.runVisitorsOnPhase(vh.phases.onFileStart, visitors, [config, packageFileObject], function() {
        vh.runVisitorsOnPhase(vh.phases.onFileContent, visitors, [config, fileObject], function() {
            if(!fileObject.content) {
                logger.logWarning("The visitors generating " + targetFilePath + " did not return any content.");
            }

            packageFileObject.content += fileObject.content;

            vh.runVisitorsOnPhase(vh.phases.onFileEnd, visitors, [config, packageFileObject], callback);
        });
    });
}

/**
 * Merge a series of files into one package file
 * @param {Array} filePaths An array of strings, each one representing the complete path to a file to be merged
 * @param {String} targetFilePath The target file path/name. The name/path can be altered depending on the visitor
 * @param {String} source [Optional] The base source folder to read files from. Defaults to ./
 * @param {String} destination [Optional] The base destination folder to write package files to. Defaults to ./
 * @param {Object} userPackages The original packages list, as configured by the user, with un-resolved paths
 * @param {Object} visitors [Optional] The list of visitors to run for this package.
 * @return {String} The target file name that was created
 */
function mergeOnePackage(filePaths, targetFilePath, config, visitors, callback) {
    source = config.source || "./";
    destination = config.destination || "./";

    var packageFileObject = new PackageFile(targetFilePath, "");

    vh.runVisitorsOnPhase(vh.phases.onPackageStart, visitors, [config, packageFileObject], function() {

        functions = [];
        for(var i = 0, l = filePaths.length; i < l; i ++) {
            (function() {
                var filePath = filePaths[i];
                functions.push(function(callback) {
                    logger.logDebug("Merging file " + filePath + " in " + targetFilePath);
                    mergeOneFile(filePath, source, packageFileObject, config, visitors, callback);
                });
            })();
        }

        sequence(functions, [], function() {
            vh.runVisitorsOnPhase(vh.phases.onPackageEnd, visitors, [config, packageFileObject], function() {
                var packageContent = packageFileObject.content;
                var packageFileName = fu.getPhysicalPath(packageFileObject.path, destination);

                fu.writeContentToFile(packageFileName, packageContent);

                callback(packageFileName);
            });
        });
    });
}

/**
 * Run the merge multiple times
 * @param {Object} config Config object telling multiMerge which packages to create and how.
 */
function merge(config, mergeDoneCallback) {
    var globalVisitors = vh.getVisitorInstances(config.visitors);

    var packages = config.packages;

    vh.runVisitorsOnPhase(vh.phases.onStart, globalVisitors, [config], function() {
        var functions = [];
        for(var packageName in config.resolvedPackages) {

            (function() {
                var name = packageName;
                var package = config.packages[name];
                var resolvedPackage = config.resolvedPackages[name];

                functions.push(function(onePackageMergedCallback) {
                    var localVisitors = globalVisitors;

                    if(resolvedPackage.visitors) {
                        localVisitors = vh.getVisitorInstances(resolvedPackage.visitors);
                    }

                    var files = resolvedPackage.files;

                    logger.logInfo("Creating package " + name);
                    if(package.visitors) {
                        logger.logDebug("Using visitors " + package.visitors);
                    } else {
                        logger.logDebug("Using visitors " + config.visitors);
                    }

                    mergeOnePackage(files, name, config, localVisitors, function(newPackageName) {
                        // Updating the original config to replace the package name with the new name
                        config.packages[newPackageName] = config.packages[name];
                        delete config.packages[name];
                        config.resolvedPackages[newPackageName] = config.resolvedPackages[name];
                        delete config.resolvedPackages[name];

                        logger.logInfo("Package " + newPackageName + " created!");

                        onePackageMergedCallback();
                    });
                });
            })();

        }

        sequence(functions, [], function() {
            vh.runVisitorsOnPhase(vh.phases.onEnd, globalVisitors, [config], mergeDoneCallback);
        });
    });
}

module.exports.mergeOnePackage = mergeOnePackage;
module.exports.merge = merge;
