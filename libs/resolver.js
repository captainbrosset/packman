var antpattern = require("./antpattern.js");


function resolveFilePaths(packages, allSourceFiles) {
    for(packageName in packages) {
        var packageFiles = [];
        var package = packages[packageName];

        if(!package.files.length) {
            if(!package.files.includes) {
                packageFiles = allSourceFiles;
            } else {
                for(var i = 0, l = allSourceFiles.length; i < l; i ++) {
                    for(var j = 0, k = package.files.includes.length; j < k; j ++) {
                        if(antpattern.match(package.files.includes[j], allSourceFiles[i])) {
                            packageFiles.push(allSourceFiles[i]);
                        }
                    }
                }
            }

            if(package.files.excludes) {
                var newPackageFiles = []
                for(var i = 0, l = packageFiles.length; i < l; i ++) {
                    for(var j = 0, k = package.files.excludes.length; j < k; j ++) {
                        if(!antpattern.match(package.files.excludes[j], packageFiles[i])) {
                            newPackageFiles.push(packageFiles[i]);
                        }
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