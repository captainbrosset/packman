var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench')

var nbOfFilesToCreate = 5000;
var srcFolder = './test/stacksrc/';
var targetFolder = './test/stacksrc/';

describe("packman stack exhaust test", function() {
  before(function() {
    wrench.mkdirSyncRecursive(srcFolder, 0777);
    for(var i = 0; i < nbOfFilesToCreate; i ++) {
      var fileName = srcFolder + 'f' + i + '.js';
      var f = fs.openSync(fileName, 'w');
      fs.writeFileSync(fileName, 'test');
      fs.closeSync(f);
    }
  });

  it("should not crash", function(done) {
    require("child_process").exec("node packman.js -l 4 -c test/stack.yaml", function(error, stdout, stderr) {
      console.error(stderr);
      assert.ok(!stderr)
      done();
    });
  });

  after(function() {
    wrench.rmdirSyncRecursive(srcFolder, true);
    wrench.rmdirSyncRecursive(targetFolder, true);
  });
});