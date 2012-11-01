var assert = require('assert');
var fs = require('fs');

describe("packman stack exhaust test", function() {
  it("should crash on missing file", function(done) {
    require("child_process").exec("node packman.js -l 4 -c test/missingfileko.yaml", function(error, stdout, stderr) {
      assert.ok(!!error && error.code === 1);
      done();
    });
  });

  it("should not crash on missing file", function(done) {
    require("child_process").exec("node packman.js -l 4 -c test/missingfileok.yaml", function(error, stdout, stderr) {
      assert.ok(error === null);
      done();
    });
  });
});