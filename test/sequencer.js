var assert = require("assert");
var sequencer = require("../libs/sequencer.js");

describe("function sequencer lib", function() {
    it("should call all functions in the right order and then the final callback", function() {

        var calls = [];
        sequencer.sequence([
            function(cb) {
                calls.push(1);
                cb();
            },
            function(cb) {
                calls.push(2);
                cb();
            },
            function(cb) {
                calls.push(3);
                cb();
            }
        ], [], function() {
            calls.push(4);

            assert.equal(calls.length, 4);
            assert.equal(calls[0], 1);
            assert.equal(calls[1], 2);
            assert.equal(calls[2], 3);
            assert.equal(calls[3], 4);
        });

    });

    it("should propagate arguments correctly to all functions", function() {

        sequencer.sequence([
            function(a, b, c, d, cb) {
                assert.equal(a, 1);
                assert.equal(b, 2);
                assert.equal(c, 3);
                assert.equal(d, 4);
                cb();
            },
            function(a, b, c, d, cb) {
                assert.equal(a, 1);
                assert.equal(b, 2);
                assert.equal(c, 3);
                assert.equal(d, 4);
                cb();
            },
            function(a, b, c, d, cb) {
                assert.equal(a, 1);
                assert.equal(b, 2);
                assert.equal(c, 3);
                assert.equal(d, 4);
                cb();
            }
        ], [1,2,3,4], function() {});

    });

    it("should only call the next function after the first one is done", function(done) {

        var firstBeingCalled = false;
        var secondBeingCalled = false;

        sequencer.sequence([
            function(cb) {
                firstBeingCalled = true;
                setTimeout(function() {
                    firstBeingCalled = false;
                    cb();
                }, 200);
            },
            function(cb) {
                secondBeingCalled = true;
                assert.equal(firstBeingCalled, false);
                setTimeout(function() {
                    secondBeingCalled = false;
                    cb();
                }, 300);
            }
        ], [], function() {
            assert.equal(firstBeingCalled, false);
            assert.equal(secondBeingCalled, false);
            done();
        });

    });
});