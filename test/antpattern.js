var assert = require("assert");
var antpattern = require("../libs/antpattern.js");

describe("ant pattern matcher lib", function() {
    it("should match pattern correctly", function() {

        assert.ok(antpattern.match("**/*.js", "aria/test/text.js"));
        assert.ok(!antpattern.match("**/*.jss", "aria/test/text.js"));
        assert.ok(antpattern.match("aria/core/**/*.js", "aria/core/text.js"));
        assert.ok(antpattern.match("aria/core/**/*.js", "aria/core/transport/IO.js"));
        assert.ok(antpattern.match("aria/core/**/*.js", "aria/core/transport/intf/IO.js"));
        assert.ok(!antpattern.match("aria/core/*.js", "aria/core/transport/intf/IO.js"));
        assert.ok(antpattern.match("aria/core/*.js", "aria/core/IO.js"));

    });
});