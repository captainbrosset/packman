var fs = require('fs');
var bind = require('bind');

module.exports.onFileContent = function(callback, config, fileObject) {
  var lineNb = fileObject.content.split('\n').length;

  if(!fileObject.packageFile.stats) {
    fileObject.packageFile.stats = [];
  }

  fileObject.packageFile.stats.push({
    path: fileObject.path,
    nb: lineNb
  });

  fileObject.content = '';
  callback();
};

function getFileSizes(stats) {
  var below10 = 0;
  var below100 = 0;
  var below500 = 0;
  var below1000 = 0;
  var above = 0;

  for(var i = 0; i < stats.length; i++) {
    if(stats[i].nb < 10) {
      below10++;
    } else if(stats[i].nb < 100) {
      below100++;
    } else if(stats[i].nb < 500) {
      below500++;
    } else if(stats[i].nb < 1000) {
      below1000++;
    } else {
      above++;
    }
  }

  return [
    {max: 10, nb: below10},
    {max: 100, nb: below100},
    {max: 500, nb: below500},
    {max: 1000, nb: below1000},
    {max: Infinity, nb: above},
  ];
};

function getFileTypes(stats) {
  var exts = {};

  for(var i = 0; i < stats.length; i++) {
    var extPos = stats[i].path.lastIndexOf('.');
    var ext = stats[i].path.substring(extPos + 1);
    if(!exts[ext]) {
      exts[ext] = 0;
    }
    exts[ext]++;
  }

  var fileTypes = [];
  for(var type in exts) {
    fileTypes.push({type: type, nb: exts[type]});
  }
  return fileTypes;
};

function getDate() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDay();

  return '' + day + '-' + month + '-' + year;
}

module.exports.onPackageEnd = function(callback, config, packageFileObject) {
  packageFileObject.path = 'Stats-' + getDate() + '.html';

  var stats = packageFileObject.stats,
    totalLines = 0;

  for(var i = 0; i < stats.length; i ++) {
    totalLines += stats[i].nb;
  }

  stats.sort(function(a, b) {
    return b.nb - a.nb;
  });

  bind.toFile(__dirname + '/stats-tpl.html', {
    sourceFolder: config.source,
    allFileStats: stats,
    nbOfFiles: stats.length,
    nbOfTotalLines: totalLines,
    averageLinesPerFile: Math.round(totalLines / stats.length),
    fileSizes: getFileSizes(stats),
    fileTypes: getFileTypes(stats)
  }, function(html) {
    packageFileObject.content = html;
    callback();
  });
};