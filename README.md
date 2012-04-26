pakman is a command line tool that can package text files.

It is written in nodejs and requires:

- optimist
- uglify-js
- wrench
- fs-extra
- less (only when using the less visitor)

(these modules are under source control in node_modules)

pakman was born of the need to group several JavaScript files together in one big, minified, versioned JavaScript file to improve websites' performance, therefore this is its most common use case. However, pakman works with any type of text files.

Basic usage
===========

	Usage: node pakman -c path/to/myconfig.json -l 4

	Options:
	  -c, --config   Path to the config file to use                                                     [required]
	  -l, --logging  Logging level (only errors = 1, also warnings = 2, also info = 3, also debug = 4)  [default: 1]

Config files are written in json and look like this

	{
	    "source": "test/src",
	    "destination": "test/build",
	    "visitors": ["myVisitor.js", "pakman/visitors/jsmin.js"]
	    "packages": {
	        "package1.js": {
	            "files": {
	                "includes": ["**/*.js"],
	                "excludes": ["**/*-test.js"]
	            }
	        },
	        "package2.js": {
	        	"files": ["file1.js", "file2.js"]
	        }
	    }
	}

The first level of the config contains general configuration like the source and destination folders to work on.

Then, inside the `packages` node, is the list of all packages to be created.

Files to be included inside a package are given in the `files` sub-node and can be either an array of file names, or an object with either `includes` or `excludes` or both. These sub-properties are arrays of file names or ant pattern (?, *, **). If an array of files is provided, the files will be merged in this order.

Visitors
========

You may have noticed that the configuration accepts a visitors array. A visitor is a piece of code that transform package content, package name and file content while things are done. This is the way to get packages perfectly fit to your needs.

Examples of visitors include (but are not restricted to) including separators between the files, minifying file content, renaming package files to include a version number, processing less css or coffeescript files.

A bunch of existing visitors can already be used from the visitors folder.

Visitors can be specified either globally at the top level of the config file, or locally, within each package definition. Visitors are configure through an array, and are, therefore, run in a sequence, one after the other.

A visitor in pakman is simply a nodejs module that exports any of the following functions:

	// At the very start, even before any files have been packaged
	onStart: function(callback, config) {},
	
	// Before starting to package a set of files together
	onPackageStart: function(callback, config, packageFileObject) {},
	
	// Before a file is being inserted into a package
	onFileStart: function(callback, config, packageFileObject) {},
	
	// When inserting the content of a file into a package
	onFileContent: function(callback, config, fileObject) {},
	
	// After a file has been inserted into a package
	onFileEnd: function(callback, config, packageFileObject) {},
	
	// After having packaged a set of files together
	onPackageEnd: function(callback, config, packageFileObject) {},
	
	// At the end, when all packages are done
	onEnd: function(callback, config) {}

Visitors' methods can be asynchronous if needed, this is why they accept a callback as their first parameter. Once their processing is done, they must call the callback to allow pakman to continue looping on other visitors, and ultimately on other files and packages.

Note that since the config is passed as argument to the above methods, you can add extra data to it to be used by visitors.

Most visitors' methods accept a `packageFileObject` as argument while the `onFileContent` method accepts a `fileObject` argument, here are their interfaces:

	PackageFile = {
	    path: "the logical path of the package file",
	    content: "the current content of the package file",
	    currentFile: "reference to the File instance that is currently being packaged if any"
	};
	
	File =  {
	    path: "the logical path of the file",
	    physicalPath: "the physical path of the file",
	    content: "the current content of the file",
	    packageFile: "reference to the PackageFile including this file"
	};

Most visitors will want to modify the fileObject.content on the fly (to minify javascript for instance) or to append content to the packageFileObject.content (to insert separators for instance).