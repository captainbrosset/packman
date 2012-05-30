module.exports = function(fs, fu) {

    fs = fs || require("fs");
    fu = fu || require("./fileutils.js");

    /**
     * Given a file path, get the modified time
     */
    function getFileMTime(file) {
        return fs.statSync(file).mtime;
    }

    /**
     * Given a list of files in a dir, get an array of stats
     */
    function getAllFileStats(files, baseDir) {
        var stats = [];
        for(var i = 0, l = files.length; i < l; i ++) {
            var file = fu.getPhysicalPath(files[i], baseDir);
            stats.push({file: file, mtime: getFileMTime(file)});
        }
        return stats;
    }

    function watch(baseDir) {

        var allFileStats = getAllFileStats(files, baseDir);

        var interval = setInterval(function() {
            for(var i = 0, l = allFileStats.length; i < l; i ++) {
                try {
                    var newMTime = getFileMTime(allFileStats[i].file);

                    if(allFileStats[i].mtime.getTime() !== newMTime.getTime()) {
                        clearInterval(interval);
                        // allFileStats[i].file CHANGED !!
                        allFileStats[i].mtime = newMTime;
                        // Call watch again after the callback is done
                        // watch();
                    }
                } catch(e) {}
            }
        }, 1000);
    }

};