var assert = require("assert");
var stringutils = require("../libs/stringutils.js");

describe("string utility", function() {
    it("should find the right start of a string", function() {
        assert.ok(stringutils.startsWith("my string", "m"));
        assert.ok(stringutils.startsWith("my string", "my"));
        assert.ok(stringutils.startsWith("my string", "my s"));
        assert.ok(!stringutils.startsWith("my string", "nooooo"));
        assert.ok(!stringutils.startsWith("my string", " "));
        assert.ok(stringutils.startsWith("my string", ""));
    });

    it("should find the right end of a string", function() {
        assert.ok(stringutils.endsWith("my string", "g"));
        assert.ok(stringutils.endsWith("my string", "ing"));
        assert.ok(stringutils.endsWith("my string", "my string"));
        assert.ok(!stringutils.endsWith("my string", "nooooo"));
        assert.ok(!stringutils.endsWith("my string", "ring "));
        assert.ok(stringutils.endsWith("my string", ""));
    });

    it("should find blank strings", function() {
        assert.ok(stringutils.isBlank(""));
        assert.ok(stringutils.isBlank("  "));
        assert.ok(stringutils.isBlank("     "));
        assert.ok(stringutils.isBlank("             "));
    });
});