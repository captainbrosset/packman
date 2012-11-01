#!/usr/bin/env node

/**
 * packman - the file packager
 * Takes in a config (json) file to tell it which files to merge, and how
 */

require("colors");
require("./libs/logger.js");
var fs = require("fs");
var fu = require("./libs/fileutils.js")();
var configReader = require("./libs/config.js");
var vh = require("./libs/visitorshandler.js");

var argv = require('optimist')
    .usage('Usage:\n  packman')
    .alias('c', 'config')
    .describe('c', 'Path to the config file to use (defaults to .packman in the current working dir)')
    .default('c', './.packman')
    .alias('l', 'logging')
    .describe('l', 'Logging level (only errors = 1, also warnings = 2, also info = 3, also debug = 4)')
    .default('l', 3)
    .alias('h', 'help')
    .boolean('h')
    .describe('h', 'Displays this message')
    .alias('w', 'watch')
    .describe('w', 'Watch for file changes and run packman again if any')
    .boolean('w')
    .alias('n', 'nologo')
    .describe('n', 'Do not display the packman logo before starting')
    .boolean('n')
    .argv
;

if(!argv.n) {
    console.log([
    "                   _                          ".yellow.bold,
    "                  | |                         ".yellow.bold,
    "  _ __   __ _  ___| | ___ __ ___   __ _ _ __  ".yellow.bold,
    " | '_ \\ / _` |/ __| |/ / '_ ` _ \\ / _` | '_ \\ ".yellow.bold,
    " | |_) | (_| | (__|   <| | | | | | (_| | | | |".yellow.bold,
    " | .__/ \\__,_|\\___|_|\\_\\_| |_| |_|\\__,_|_| |_|".yellow.bold,
    " | |                     ".yellow.bold + "pack it up like a man ".yellow,
    " |_|                                          ".yellow.bold,
    ""
    ].join("\n"));
} else {
    console.log();
}

function getFileMTime(file) {
    return fs.statSync(file).mtime;
}

function getAllFileStats(files, baseDir) {
    var stats = [];
    for(var i = 0, l = files.length; i < l; i ++) {
        var file = fu.getPhysicalPath(files[i], baseDir);
        stats.push({file: file, mtime: getFileMTime(file)});
    }
    return stats;
}

if(argv.h) {
    console.log(require('optimist').help());
} else {
    logger.level = argv.l;

    var allFileStats = [];

    function packman(callback) {
        var startTime = new Date().getTime();

        var config = configReader.get(argv.c);

        if(config !== null && Object.keys(config.packages).length > 0) {

            // TODO: clean this up a bit to do it once rather than in merger.js again
            var globalVisitors = vh.getVisitorInstances(config.visitors);
            vh.runVisitorsOnPhase(vh.phases.onAfterConfigLoaded, globalVisitors, [config], function() {

                var isEnvReady = require("./libs/env.js").prepare(config.destination, config.eraseIfExists);

                if(isEnvReady) {
                    var allSourceFiles = require("./libs/finder.js").getAllSourceFiles(config.source);

                    if(allSourceFiles.length > 0) {

                        var resolvedPackages = require("./libs/clone.js").clone(config.packages);
                        resolvedPackages = require("./libs/resolver.js").resolveFilePaths(resolvedPackages, allSourceFiles);
                        config.resolvedPackages = resolvedPackages;

                        logger.logInfo("Getting started with: source=" + config.source + ", destination=" + config.destination + ", eraseIfExists=" + config.eraseIfExists);

                        var merger = require("./libs/merger.js");

                        merger.merge(config, function() {
                            console.log("");
                            var time = ((new Date().getTime()) - startTime) / 1000;
                            if(!argv.w) {
                                console.log((" packman did it again! Have a great day! (" + time + " sec)").yellow.bold);
                            }
                            console.log("");
                            if(callback)    callback();
                        });
                    }

                    allFileStats = getAllFileStats(allSourceFiles, config.source);

                } else {
                    logger.logWarning("packman could not prepare the destination directory, there's an existing file at " + config.destination);
                    logger.logWarning("Make sure you configure the proper destination directory path or set the 'eraseIfExists' config flag to true.");
                }

            });

        }
    }

    if(argv.w) {
        progress = require("./libs/progress.js");
        progress.play();

        function watch() {
            var startedAt = new Date().getTime();

            var interval = setInterval(function() {
                progress.updateWaitingMessage((new Date().getTime() - startedAt) / 1000);

                for(var i = 0, l = allFileStats.length; i < l; i ++) {
                    try {
                        var newMTime = getFileMTime(allFileStats[i].file);

                        if(allFileStats[i].mtime.getTime() !== newMTime.getTime()) {
                            clearInterval(interval);
                            process.stdout.write("\r");

                            logger.logInfo("File " + allFileStats[i].file + " changed, packman will run again");
                            console.log("");
                            allFileStats[i].mtime = newMTime;

                            packman(function() {
                                watch();
                            });
                        }
                    } catch(e) {}
                }
            }, 1000);
        }
        packman(function() {
            watch();
        });
    } else {
        packman();
    }

}
