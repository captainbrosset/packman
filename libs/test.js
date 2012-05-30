var fs = require("fs");

function walkDir(directory, handler) {
    var files = fs.readdirSync(directory);
    for(var i = 0, l = files.length; i < l; i ++) {
        var fullFilePath = directory + "/" + files[i];
        var stats = fs.statSync(fullFilePath);
        if(stats.isFile()) {
            handler(fullFilePath);
        } else if(stats.isDirectory()) {
            walkDir(fullFilePath, handler);
        }
    }
}


walkDir(".", function(file) {
    console.log(file);
});