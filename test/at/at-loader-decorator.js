function getAriaUrlMap(userPackages) {
    var map = {};
    for(var packageName in userPackages) {
        var package = userPackages[packageName];
        if(package.files.includes) {
            console.log(packageName);
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

module.exports.onPackageStart = function(fileName, config, userPackages) {
    // add license text
    return "/*\nLicense Apache v2\n*/\n";
};

module.exports.onPackageEnd = function(fileName, config, userPackages) {
    // compute map and add loader code
    var map = getAriaUrlMap(userPackages);
    return "\n\naria.core.DownloadMgr.updateUrlMap(" + JSON.stringify(map) + ");";
};

module.exports.onPackageName = function(fileName, fileContent, config, userPackages) {
    var name = fileName.substring(0, fileName.lastIndexOf("."));
    return name + "-" + config.version + ".js";
};