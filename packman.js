#!/usr/bin/env node

/**
 * packman - the file packager
 * Takes in a config (json) file to tell it which files to merge, and how
 */

require("colors");

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

var startTime = new Date().getTime();

var fs = require("fs");
require("./libs/logger.js");

var argv = require('optimist')
    .usage('Package files.\nUsage: $0 -c path/to/myconfig.json')
    .demand('c')
    .alias('c', 'config')
    .describe('c', 'Path to the config file to use')
    .alias('l', 'logging')
    .describe('l', 'Logging level (only errors = 1, also warnings = 2, also info = 3, also debug = 4)')
    .default('l', 1)
    .argv
;

logger.level = argv.l;

var config = require("./libs/config.js").get(argv.c)

if(config !== null && Object.keys(config.packages).length > 0) {
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
                var time = ((new Date().getTime()) - startTime)/1000;
                console.log((" packman did it again! Have a great day! (" + time + " sec)").yellow.bold);
            });
        }
    } else {
        logger.logWarning("packman could not prepare the destination directory, there's an existing file at " + config.destination);
        logger.logWarning("Make sure you configure the proper destination directory path or set the 'eraseIfExists' config flag to true.");
    }
}
