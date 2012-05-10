var assert = require("assert");

describe("yaml2js converter", function() {
    it("should log an error and return null for invalid yaml", function() {

        var mockYamlLib = {
            load: function(text) {
                throw {};
            }
        };
        var mockLog = {
            logErrorCalled: false,
            logError: function(msg) {
                this.logErrorCalled = true;
            }
        };
        var y2j = require("../libs/yaml2js.js")(mockYamlLib, mockLog);
        var js = y2j.toJs("whatever");
        assert.ok(mockLog.logErrorCalled);
        assert.ok(js === null);

    });
    it("should return js for valid yaml", function() {

        var mockYamlLib = {
            load: function(text) {
                return {};
            }
        };
        var mockLog = {
            logErrorCalled: false,
            logError: function(msg) {
                this.logErrorCalled = true;
            }
        };
        var y2j = require("../libs/yaml2js.js")(mockYamlLib, mockLog);
        var js = y2j.toJs("whatever");
        assert.ok(mockLog.logErrorCalled === false);
        assert.ok(typeof js === "object");

    });
});