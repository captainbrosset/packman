var assert = require("assert");

describe("file utils lib", function() {
    it("should build the a physical path", function() {

        var fu = require("../libs/fileutils.js")();

        assert.equal(fu.getPhysicalPath("my/file.js", "root/dir"), "root/dir/my/file.js");
        assert.equal(fu.getPhysicalPath("my/file.js", "./root/dir"), "./root/dir/my/file.js");
        assert.equal(fu.getPhysicalPath("my/file.js", "/root/dir"), "/root/dir/my/file.js");
        assert.equal(fu.getPhysicalPath("/my/file.js", "/root/dir/"), "/root/dir/my/file.js");
        assert.equal(fu.getPhysicalPath("my/file.js", "/root/dir/"), "/root/dir/my/file.js");
        assert.equal(fu.getPhysicalPath("./my/file.js", "/root/dir/"), "/root/dir/my/file.js");

        assert.equal(fu.getPhysicalPath("file.js", ""), "./file.js");
        assert.equal(fu.getPhysicalPath("./my/super/file.js", ""), "./my/super/file.js");

    });

    it("should write content to the right file, creating the right folder", function() {

        var fileGiven = "", dirFound = "", fileFoundForOpening = "", content = "some content to be written";

        var wrenchMock = {
            mkdirSyncRecursive: function(directoryPath, mode) {
                assert.equal(directoryPath, dirFound);
            }
        };
        var fsMock = {
            openSync: function(filePath, mode) {
                assert.equal(filePath, fileFoundForOpening);
                return {};
            },
            writeSync: function(fd, newContent) {
                assert.equal(content, newContent);
            },
            closeSync: function(fd) {}
        };

        var fu = require("../libs/fileutils.js")(wrenchMock, fsMock);

        fileGiven = "/the/source/file.txt";
        dirFound = "/the/source";
        fileFoundForOpening = "/the/source/file.txt";
        fu.writeContentToFile(fileGiven, content);

        fileGiven = "./the/source/file.txt";
        dirFound = "./the/source";
        fileFoundForOpening = "./the/source/file.txt";
        fu.writeContentToFile(fileGiven, content);

        fileGiven = "the/source/file.txt";
        dirFound = "the/source";
        fileFoundForOpening = "the/source/file.txt";
        fu.writeContentToFile(fileGiven, content);

        fileGiven = "file.txt";
        dirFound = ".";
        fileFoundForOpening = "./file.txt";
        fu.writeContentToFile(fileGiven, content);

        fileGiven = "./somefile.txt";
        dirFound = ".";
        fileFoundForOpening = "./somefile.txt";
        fu.writeContentToFile(fileGiven, content);
    });
});