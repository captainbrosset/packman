var antpattern = require("./antpattern.js");


function isFileMatchingAtLeastOne(filePath, patterns) {
    for(var i = 0, l = patterns.length; i < l; i ++) {
        if(antpattern.match(patterns[i], filePath)) {
            return true;
        }
    }
    return false;
}

function resolveFilePaths(packages, allSourceFiles) {
    for(packageName in packages) {
        var packageFiles = [];
        var package = packages[packageName];

        if(!package.files.length) {
            if(!package.files.includes) {
                packageFiles = allSourceFiles;
            } else {
                for(var i = 0, l = allSourceFiles.length; i < l; i ++) {
                    if(isFileMatchingAtLeastOne(allSourceFiles[i], package.files.includes)) {
                        packageFiles.push(allSourceFiles[i]);
                    }
                }
            }

            if(package.files.excludes) {
                var newPackageFiles = []
                for(var i = 0, l = packageFiles.length; i < l; i ++) {
                    if(!isFileMatchingAtLeastOne(packageFiles[i], package.files.excludes)) {
                        newPackageFiles.push(packageFiles[i]);
                    }
                }
                packageFiles = newPackageFiles;
            }
        } else {
            packageFiles = package.files;
        }

        package.files = packageFiles;
    }

    return packages;
}


module.exports.resolveFilePaths = resolveFilePaths;