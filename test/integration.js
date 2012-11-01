var assert = require('assert');
var fs = require('fs');

function walkDir(directory, handler, originalDirectory) {
  var files = fs.readdirSync(directory);
  for(var i = 0, l = files.length; i < l; i++) {
    var fullFilePath = directory + '/' + files[i];
    var stats = fs.statSync(fullFilePath);
    if(stats.isFile()) {
      if(originalDirectory) {
        handler(fullFilePath.substring(originalDirectory.length + 1));
      } else {
        handler(fullFilePath.substring(directory.length + 1));
      }
    } else if(stats.isDirectory()) {
      walkDir(fullFilePath, handler, originalDirectory || directory);
    }
  }
}

describe('packman simple integration test', function() {
  it('should work', function(done) {
    require('child_process').exec('node packman.js -l 4 -c test/integration.yaml', function(error, stdout, stderr) {
      walkDir('test/target', function(file) {
        // Verify that target exists and contains one file all.pack
        assert.equal(file, 'all.pack');
      });
      var content = fs.readFileSync('test/target/all.pack', 'utf-8');
      var packagedFiles = content.match(/File: [a-zA-Z]+\/[a-zA-Z]+\.js/g);
      packagedFiles.forEach(function(item) {
        var dir = item.substring(6, item.indexOf('/'));
        // Verify that excludes worked
        assert.ok(dir !== 'node_modules');
        assert.ok(dir !== 'test');
      });
      done();
    });
  });
});