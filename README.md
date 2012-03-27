pakman is a command line tool that can package text files.

It is written in nodejs and requires:

- optimist
- uglify-js
- wrench
- fs.extra

pakman was born of the need to group several JavaScript files together in one big, minified, versioned JavaScript file to improve websites' performance, therefore this is its most common use case. However, pakman works with any type of text files.

Basic usage
===========

	Usage: node ./pakman -c path/to/myconfig.json

	Options:
	  -c, --config  Path to the config file to use  [required]

Config files are written in json and look like this

	{
	    "config": {
	        "md5": true,
	        "mangle": true
	    },
	    "source": "test/src",
	    "destination": "test/build",
	    "packages": {
	        "package1.js": {
	        	"config": {...}
	            "files": {
	                "includes": ["**/*.js"],
	                "excludes": ["**/*-test.js"]
	            },
	            "decorator": "mydecorator.js",
	        },
	        "package2.js": {
	        	"files": ["file1.js", "file2.js"]
	        }
	    }
	}

The first level of the config contains general configuration to be applied for all packages as well as the source and destination folder to work on.

Then, inside the `packages` node, is the list of all packages to be created. Each package definition can also override the config and decorator settings.

Files to be included inside a package are given in the `files` sub-node and can be either an array of file names, or an object with either `includes` or `excludes` or both. These sub-properties are arrays of file names or ant pattern (?, *, **).


Note that pakman is based on several standalone tools that can also be used from the command line:

jsmin
=====

Minify a JavaScript file.

	Usage: node ./jsmin.js -s path/to/myFile.js -m

	Options:
	  -s, --source  Path to the file to be minified  [required]
	  -m, --mangle  Mangle variable names            [boolean]

md5
===

Version a file using the MD5 hash.

	Usage: node ./md5 -s path/to/myFile.js

	Options:
	  -s, --source   Path to the file to be versioned                              [required]
	  -t, --target   Target directory to save the file to                          [default: "where the source is"]
	  -p, --pattern  Destination file pattern (use [name], [md5] and [extension])  [default: "[name]-[md5].[extension]"]

merger
======

Merge files together.

	Usage: node ./merger -f file1.js file2.js file3.js -t pack.js --jsmin --md5 -d mydecorator.js

	Options:
	  -f, --files      List of files to be packaged                                [required]
	  -t, --target     Target package file (name will be changed if md5 is passed  [required]
	  -m, --jsmin      Minify javascript files (only applies to .js files)         [boolean]  [default: true]
	  -v, --md5        Version the target package with md5 hash                    [boolean]  [default: false]
	  -d, --decorator  The decorator module to be used                             [default: "./merger-defaultdecorator.js"]

Using as node modules
=====================

The 3 command line tools above are also nodejs modules, therefore they can be required by other modules and used as part of a bigger program.

	var merger = require("./merger.js");
	merger.merge(["file1.js", "file2.js"], "pack.js");

Decorators
==========

You may have noticed that the merger tool can take a decorator as argument (or command line parameter). The decorator is the piece of code that does the actual merge of files. The default decorator is `merger-defaultdecorator.js`.

A decorator in pakman is a nodejs module that exports the following 6 functions:

	/**
	 * Called to alter the physical name of the package file before it is saved to the disk. Used to version the filename.
	 * @param {String} fileName The logical package filename, as configured
	 * @param {String} fileContent The content of the package file
	 * @param {Object} config A resolved config object, as specified in the package config, or global config
	 * @param {Object} userPackages The list of packages as configured in the config, with unresolved paths
	 * @return {String} The physical file name
	 */
	module.exports.onPackageName = function(fileName, fileContent, config, userPackages) {};

	/**
	 * Called when a package file starts. Used to output header information into the file
	 * @param {String} fileName The logical package filename, as configured
	 * @param {Object} config A resolved config object, as specified in the package config, or global config
	 * @param {Object} userPackages The list of packages as configured in the config, with unresolved paths
	 * @return {String} The content to put an the top of the packaged file
	 */
	module.exports.onPackageStart = function(fileName, config, userPackages) {};

	/**
	 * Called when a package file ends.
	 * @param {String} fileName The logical package filename, as configured
	 * @param {Object} config A resolved config object, as specified in the package config, or global config
	 * @param {Object} userPackages The list of packages as configured in the config, with unresolved paths
	 * @return {String} The content to put an the top of the packaged file
	 */
	module.exports.onPackageEnd = function(fileName, config, userPackages) {};

	/**
	 * Called before the content of a source file is put into a package. Used to add delimiters to the package
	 * @param {String} fileName The source folder relative file path
	 * @param {String} packageFileName The logical package filename, as configured
	 * @param {Object} config A resolved config object, as specified in the package config, or global config
	 * @param {Object} userPackages The list of packages as configured in the config, with unresolved paths
	 * @return {String} The content to put in the packaged file
	 */
	module.exports.onFileStart = function(fileName, packageFileName, config, userPackages) {};

	/**
	 * Called when the content of a source file is being put into a package. Used to process the source code
	 * @param {String} fileName The source folder relative file path
	 * @param {String} fileContent The content of the file
	 * @param {Object} config A resolved config object, as specified in the package config, or global config
	 * @param {Object} userPackages The list of packages as configured in the config, with unresolved paths
	 * @return {String} The content to put in the packaged file
	 */
	module.exports.onFileContent = function(fileName, fileContent, config, userPackages) {};

	/**
	 * Called after the content of a source file is put into a package. Used to add delimiters to the package
	 * @param {String} fileName The source folder relative file path
	 * @param {String} packageFileName The logical package filename, as configured
	 * @param {Object} config A resolved config object, as specified in the package config, or global config
	 * @param {Object} userPackages The list of packages as configured in the config, with unresolved paths
	 * @return {String} The content to put in the packaged file
	 */
	module.exports.onFileEnd = function(fileName, packageFileName, config, userPackages) {};

Each of these functions must return a string that will be used to output the package content or file name. The goal of the decorator is to process file content or insert separators if needed.

The default decorator minifies the content of JavaScript files and versions the package file name with the corresponding md5 hash.

The config object passed to the merger is passed to each function.