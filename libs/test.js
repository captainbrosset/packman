var fs = require("fs");

function walkDir(directory, visitor) {
    var files = fs.readdirSync(directory);
    for(var i = 0, l = files.length; i < l; i ++) {
        var fullFilePath = directory + "/" + files[i];
        var stats = fs.statSync(fullFilePath);
        if(stats.isDirectory()) {
            walkDir(fullFilePath, visitor);
        }
        visitor(fullFilePath, stats);
    }
}


walkDir(".", function(file, stats) {
    console.log(file + " is a " + (stats.isDirectory() ? "dir" : "file"));
});