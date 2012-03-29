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
                for(var index = 0, nbOfFiles = allSourceFiles.length; index < nbOfFiles; index ++) {
                    if(isFileMatchingAtLeastOne(allSourceFiles[index], package.files.includes)) {
                        packageFiles.push(allSourceFiles[index]);
                    }
                }
            }

            if(package.files.excludes) {
                var newPackageFiles = [];
                for(var index = 0, nbOfFiles = packageFiles.length; index < nbOfFiles; index ++) {
                    if(!isFileMatchingAtLeastOne(packageFiles[index], package.files.excludes)) {
                        newPackageFiles.push(packageFiles[index]);
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