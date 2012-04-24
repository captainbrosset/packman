var fs = require("fs");
var defaultDecorator = require("../../merger-defaultdecorator.js");

function getAriaUrlMap(userPackages) {
    var map = {};
    for(var packageName in userPackages) {
        var package = userPackages[packageName];
        if(package.files.includes) {
            for(var i = 0; i < package.files.includes.length; i ++) {
                var path = package.files.includes[i];
                var parts = path.split("/");
                var parent = map;
                for(var p = 0; p < parts.length; p ++) {
                    var partName = parts[p];
                    if(partName.substring(0,1) != "*") {
                        if(!parent[partName]) {
                            parent[partName] = {};
                            parent = parent[partName];
                            continue;
                        }
                    } else if(partName.substring(0, 2) === "**") {
                        // nothing to do here ?
                    } else {
                        parent["*"] = packageName;
                    }
                }
            }
        }
    }
    return map;
}

function getFileExtension(fileName) {
    return fileName.substring(fileName.lastIndexOf(".") + 1);
}

module.exports.onPackageStart = function(fileName, config, userPackages) {
    return "" + "\n//***MULTI-PART";
};

module.exports.onFileStart = function(fileName, packageFileName, config, userPackages) {
	var uniqueSeparator = "\n//:::::::::::::\n";
    return uniqueSeparator + "//LOGICAL-PATH:" + fileName + uniqueSeparator;
};

module.exports.onFileContent = function(fileName, fileContent, config, userPackages) {
    if(getFileExtension(fileName) === "js") {
        return defaultDecorator.onFileContent(fileName, fileContent, config, userPackages);
    } else if(getFileExtension(fileName) === "tpl") {
        // TODO : pre-compile templates
        return fileContent;
    } else {
        return fileContent;
    }
};

module.exports.onEnd = function(config, userPackages) {
    // compute map and add loader code
    var map = getAriaUrlMap(userPackages);
    var ariaMap = "\n\naria.core.DownloadMgr.updateUrlMap(" + JSON.stringify(map) + ");";

    // Find out which of the files is the loader one
    var loaderFile = "";
    for(var p in userPackages) {
        if(userPackages[p].decorator && userPackages[p].decorator.indexOf("at-loader-decorator.js") !== -1) {
            loaderFile = p;
        }
    }

    var fd = fs.openSync(config.destination + "/" + loaderFile, "a+");
    fs.writeSync(fd, ariaMap);
    fs.closeSync(fd);
};
