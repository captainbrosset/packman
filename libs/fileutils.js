module.exports = function(wrench, fs, stringutils) {
    wrench = wrench || require("wrench");
    fs = fs || require("fs");
    stringutils = stringutils || require("./stringutils.js");

    function getParentDirectoryPath(file) {
        return file.substring(0, file.lastIndexOf("/"));
    }

    function writeContentToFile(file, content) {
        if(content) {
            if(file.indexOf("/") === -1) {
                file = "./" + file;
            }
            wrench.mkdirSyncRecursive(getParentDirectoryPath(file), 0777);
            var fd = fs.openSync(file, "w");
            fs.writeSync(fd, content);
            fs.closeSync(fd);
        }
    }

    function getPhysicalPath(logicalPath, directory) {
        if(stringutils.isBlank(directory)) {
            directory = ".";
        }

        if(directory.substring(directory.length - 1) !== "/") {
            directory += "/";
        }

        if(logicalPath.substring(0, 1) == "/") {
            return directory + logicalPath.substring(1);
        }
        if(logicalPath.substring(0, 2) == "./") {
            return directory + logicalPath.substring(2);
        }
        return directory + logicalPath;
    }

    return {
        writeContentToFile : writeContentToFile,
        getPhysicalPath : getPhysicalPath
    };
};
