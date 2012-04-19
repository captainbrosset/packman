var clone = require("./clone.js").clone;

var phases = {
    onFileContent: "onFileContent",
    onFileStart: "onFileStart",
    onFileEnd: "onFileEnd",
    onPackageName: "onPackageName",
    onPackageStart: "onPackageStart",
    onPackageEnd: "onPackageEnd",
    onMultiMergeStart: "onMultiMergeStart",
    onMultiMergeEnd: "onMultiMergeEnd"
};

function overrideObject(src, dest) {
    var newObject = clone(src);

    for(var i in dest) {
        newObject[i] = dest[i];
    }

    return newObject;
}

/**
 * Get the "normalized" visitor, so it is safe to call all of its functions
 */
function normalizeVisitor(visitor) {
    var empty = function() {};
    var emptyVisitor = {};
    for (var p in phases) {
        emptyVisitor[phases[p]] = empty;
    }
    return overrideObject(emptyVisitor, visitor);
}

/**
 * Try to load custom visitors given an array of file paths, and normalize them as we go
 * @param {Array} visitors The list of file paths of visitors to load
 * @param {Boolean} verbose Output more debug info
 * @return {Array} An array of visitor instance
 */
function getVisitorInstances(visitors, verbose) {
    var visitorInstances = [];

    for(var i = 0, l = visitors.length; i < l; i ++) {
        var visitor = visitors[i], visitorInstance = {};

        try {
            if(visitor.substring(0,1) !== "/" && visitor.substring(0,2) !== "./") {
                visitor = "./" + visitor;
            }
            visitorInstance = require(visitor);
        } catch(e) {
            if(verbose) {
                console.warn("\n  !! Custom visitor " + visitor + " could not be loaded !!\n", e);
            }
        }
        
        visitorInstances.push(normalizeVisitor(visitorInstance));
    }

    return visitorInstances;
}

function runVisitorsOnPhase(phase, visitors, args, chainArg) {
    for(var i = 0, l = visitors.length; i < l; i ++) {
        var visitor = visitors[i];
        var visitorFunction = visitor[phases[phase]];
        chainArg = visitorFunction(args, chainArg);
    }
    return chainArg;
}

module.exports.getVisitorInstances = getVisitorInstances;
module.exports.phases = phases;
module.exports.runVisitorsOnPhase = runVisitorsOnPhase;
