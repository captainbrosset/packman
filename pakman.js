var argv = require('optimist')
    .usage('Package files.\nUsage: $0 -c path/to/myconfig.json')
    .demand('c')
    .alias('c', 'config')
    .describe('c', 'Path to the config file to use')
    .boolean('v')
    .alias('v', 'verbose')
    .describe('v', 'Be all verbose about it')
    .default('v', false)
    .argv
;

var configLib = require("./libs/config.js");
var config = configLib.get(argv.c);
var originalConfig = configLib.clone(config);

require("./libs/env.js").prepare(config.destination);
var allSourceFiles = require("./libs/finder.js").getAllSourceFiles(config.source);
var packages = require("./libs/resolver.js").resolveFilePaths(config.packages, allSourceFiles);
config.packages = packages;

if(argv.v) {
    console.log("\n  Source: " + config.source);
    console.log("  Destination: " + config.destination);
    console.log("  Global config: ", config.config);
}

var merger = require("./merger.js");
merger.multiMerge(config, originalConfig.packages, argv.v);

console.log("\nPakman did it again! Have a great day!");
