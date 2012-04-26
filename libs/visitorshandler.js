var clone = require("./clone.js");


var phases = {
    // At the very start, even before any files have been packaged
    onStart: "onStart",
    // Before starting to package a set of files together
    onPackageStart: "onPackageStart",
    // Before a file is being inserted into a package
    onFileStart: "onFileStart",
    // When inserting the content of a file into a package
    onFileContent: "onFileContent",
    // After a file has been inserted into a package
    onFileEnd: "onFileEnd",
    // After having packaged a set of files together
    onPackageEnd: "onPackageEnd",
    // At the end, when all packages are done
    onEnd: "onEnd"
};

function overrideObject(src, dest) {
    var newObject = clone.clone(src);

    for(var i in dest) {
        newObject[i] = dest[i];
    }

    return newObject;
}

/**
 * Get the "normalized" visitor, so it is safe to call all of its functions
 */
function normalizeVisitor(visitor) {
    var empty = function(callback) {callback()};
    var emptyVisitor = {};
    for (var p in phases) {
        emptyVisitor[phases[p]] = empty;
    }
    return overrideObject(emptyVisitor, visitor);
}

// Is this a visitor from the default pakman install
function isDefaultVisitor(path) {
    return path.indexOf(".") === -1;
}

function isAbsolutePath(path) {
    return path.substring(0, 1) === "/";
}

function getVisitorInstance(visitorPath) {
    var visitorInstance = {};
    try {
        if(isDefaultVisitor(visitorPath)) {
            // If this is a default visitor (myVisitor)
            visitorPath = "../visitors/" + visitorPath + ".js";

        } else if(!isAbsolutePath(visitorPath)) {
            // If the path does not start with / (myVisitor.js or path/to/visitor.js or ./path/to/myvisitor.js)
            visitorPath = process.cwd() + "/" + visitorPath;
        }

        visitorInstance = require(visitorPath);
    } catch(e) {
        logger.logError("Custom visitor " + visitorPath + " could not be loaded, pakman will run anyway, just skipping this visitor", e);
    }
    return visitorInstance;
}

/**
 * Try to load custom visitors given an array of file paths, and normalize them as we go
 * @param {Array} visitors The list of file paths of visitors to load
 * @return {Array} An array of visitor instance
 */
function getVisitorInstances(visitors) {
    var visitorInstances = [];

    for(var i = 0, l = visitors.length; i < l; i ++) {
        logger.logDebug("Loading visitor " + visitors[i]);
        visitorInstances.push(normalizeVisitor(getVisitorInstance(visitors[i])));
    }

    return visitorInstances;
}

/**
 * Run all visitors on a given phase, asynchronously
 */
function runVisitorsOnPhase(phase, visitors, args, callback) {
    var visitors = clone.cloneArray(visitors);
    if(visitors.length === 0) {
        callback();
    } else {
        var visitor = visitors.splice(0, 1)[0];
        visitor[phases[phase]].apply(null, [function() {
            runVisitorsOnPhase(phase, visitors, args, callback);
        }].concat(args));
    }
}

module.exports.getVisitorInstances = getVisitorInstances;
module.exports.phases = phases;
module.exports.runVisitorsOnPhase = runVisitorsOnPhase;
