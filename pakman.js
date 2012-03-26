var argv = require('optimist')
    .usage('Package files.\nUsage: $0 -c path/to/myconfig.json')
    .demand('c')
    .alias('c', 'config')
    .describe('c', 'Path to the config file to use')
    .argv
;

var config = require("./libs/config.js").get(argv.c);
require("./libs/env.js").prepare(config.destination);
var allSourceFiles = require("./libs/finder.js").getAllSourceFiles(config.source);
var packages = require("./libs/resolver.js").resolveFilePaths(config.packages, allSourceFiles);
config.packages = packages;

var merger = require("./merger.js");
merger.multiMerge(config);