/**
 * Merge text files together.
 * This is particularly useful for website static resources to reduce the number of http requests to download files.
 * The merger can retrieve and lists files to be merged, and then delegate to a "decorator" to take care of processing
 * files before they are merged, or insert separators between them.
 */


var fs = require("fs");
var wrench = require("wrench");


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

function overrideObject(src, dest) {
    var newObject = require("./libs/clone.js").clone(src);

    for(var i in dest) {
        newObject[i] = dest[i];
    }

    return newObject;
}

function getConfig(config) {
    return overrideObject({
        jsmin: true,
        mangle: false,
        md5: false
    }, config);
}

/**
 * Get the "normalized" decorator, so it is safe to call all of its functions
 */
function getDecorator(decorator) {
    return overrideObject(require("./merger-defaultdecorator.js"), decorator);
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
 * @param {String} targetFilePath The target file path/name. The name/path can be altered depending on the decorator
 * @param {String} source [Optional] The base source folder to read files from. Defaults to ./
 * @param {String} destination [Optional] The base destination folder to write package files to. Defaults to ./
 * @param {Object} config [Optional] The default config object is {jsmin: true, mangle: false, md5: false}. Pass your own object to override it. Note that this will be passed to each function of the decorator too.
 * @param {Object} decorator [Optional] The default decorator implements the following functions: onFileContent(fileName, fileContent, config), onPackageStart(fileName, config), onPackageEnd(fileName, config), onFileStart(fileName, packageFileName, config), onFileEnd(fileName, packageFileName, config), onPackageName(fileName, fileContent, config), to react to events when the files are being merged. If you pass your own object with methods here, they will override the default decorator.
 * @param {Object} userPackages The original packages list, as configured by the user, with un-resolved paths
 * @param {Boolean} verbose Whether to output debug info
 * @return {String} The target file name that was created
 */
function merge(filePaths, targetFilePath, source, destination, config, decorator, userPackages, verbose) {
    source = source || "./";
    destination = destination || "./";
    config = getConfig(config);
    decorator = getDecorator(decorator);

    var mergedFileContent = "";

    mergedFileContent += decorator.onPackageStart(targetFilePath, config, userPackages);

    for(var i = 0, l = filePaths.length; i < l; i ++) {
        var filePath = filePaths[i];
        var physicalFilePath = getPhysicalPath(filePath, source);

        mergedFileContent += decorator.onFileStart(filePath, targetFilePath, config, userPackages);

        var fileContent = fs.readFileSync(physicalFilePath, "utf-8");
        fileContent = decorator.onFileContent(filePath, fileContent, config, userPackages);
        if(!fileContent && verbose) {
            console.warn("\n  !! The custom decorator generating " + targetFilePath + " needs to return a string from onFileContent().");
        }

        mergedFileContent += fileContent;

        mergedFileContent += decorator.onFileEnd(filePath, targetFilePath, config, userPackages);
    }

    mergedFileContent += decorator.onPackageEnd(targetFilePath, config, userPackages);

    var newTargetFilePath = decorator.onPackageName(targetFilePath, mergedFileContent, config, userPackages);
    if(!newTargetFilePath) {
        newTargetFilePath = targetFilePath;
        if(verbose) {
            console.warn("\n  !! The custom decorator generating " + targetFilePath + " needs to return a string from onPackageName(). Default name chosen.");
        }
    }

    var physicalPackageFilePath = getPhysicalPath(newTargetFilePath, destination);

    writeContentToFile(physicalPackageFilePath, mergedFileContent);

    return newTargetFilePath;
}

function getCustomDecorator(decoratorConfig, verbose) {
    var customDecorator = {};
    if(decoratorConfig) {
        try {
            if(decoratorConfig.substring(0,1) !== "/" && decoratorConfig.substring(0,2) !== "./") {
                decoratorConfig = "./" + decoratorConfig;
            }
            customDecorator = require(decoratorConfig);
        } catch(e) {
            if(verbose) {
                console.warn("\n  !! Custom decorator " + decoratorConfig + " could not be loaded. Continuing with default decorator.", e);
            }
        }
    }
    return getDecorator(customDecorator);
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
 *   decorator: "myDecoratorModule.js",
 *   packages: {
 *     "myPackage1.js": {
 *       decorator: "localDecoratorModule.js",
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
 * The same applies for decorators.
 * @param {Object} userPackages The original packages list, as configured by the user, with un-resolved paths
 * @param {Boolean} verbose Output more debug information
 */
function multiMerge(config, userPackages, verbose) {
    var globalConfig = config.config || {};
    var globalDecorator = getCustomDecorator(config.decorator, verbose) || {};

    var packages = config.packages;

    globalDecorator.onMultiMergeStart(config, userPackages);

    for(var packageName in packages) {
        var localConfig = overrideObject(globalConfig, packages[packageName].config || {});
        var localDecorator = overrideObject(globalDecorator, getCustomDecorator(packages[packageName].decorator, verbose));

        var files = packages[packageName].files;

        if(verbose) {
            console.log("\n  + " + packageName);
            for(var i = 0, l = files.length; i < l; i ++) {
                console.log("  | " + files[i]);
            }
        }

        var newPackageName = merge(files, packageName, config.source, config.destination, localConfig, localDecorator, userPackages, verbose);

        userPackages[newPackageName] = userPackages[packageName];
        delete userPackages[packageName];

        console.log("  >>> Package " + newPackageName + " created!");
    }

    globalDecorator.onMultiMergeEnd(config, userPackages);
}


if(!module.parent) {

    var argv = require('optimist')
        .usage('Merge file together.\nUsage: $0 -f file1.js file2.js file3.js -t pack.js --jsmin --md5 -d mydecorator.js')
        .demand('f')
        .alias('f', 'files')
        .describe('f', 'List of files to be packaged')
        .demand('t')
        .alias('t', 'target')
        .describe('t', 'Target package file (name will be changed if md5 is passed')
        .boolean('m')
        .alias('m', 'jsmin')
        .default('m', true)
        .describe('m', 'Minify javascript files (only applies to .js files)')
        .boolean('v')
        .alias('v', 'md5')
        .default('v', false)
        .describe('v', 'Version the target package with md5 hash')
        .default('d', './merger-defaultdecorator.js')
        .alias('d', 'decorator')
        .describe('d', 'The decorator module to be used')
        .argv
    ;

    var files = [argv.f];
    for(var i = 0, l = argv._.length; i < l; i ++) {
        files.push(argv._[i]);
    }

    console.log("Merging files " + files);

    var userPackages = {};
    userPackages[argv.t] = {"files": files};

    var newFileName = merge(files, argv.t, null, null, {jsmin: argv.m, md5: argv.v}, require(argv.d), userPackages);

    console.log("Package file " + newFileName + " created!");

} else {
    module.exports.merge = merge;
    module.exports.multiMerge = multiMerge;
}
