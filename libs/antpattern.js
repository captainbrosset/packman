var StringUtils = {
	startsWith: function(str, start) {
		return str.substring(0, start.length) === start;
	},
	endsWith: function(str, end) {
		return str.substring(str.length - end.length) === end;
	}
};

var pathSeparator = "/";

function match(pattern, str) {
	if (StringUtils.startsWith(str, pathSeparator) != StringUtils.startsWith(pattern, pathSeparator)) {
		return false;
	}

	var patDirs = pattern.split(pathSeparator);
	var strDirs = str.split(pathSeparator);

	var patIdxStart = 0;
	var patIdxEnd = patDirs.length - 1;
	var strIdxStart = 0;
	var strIdxEnd = strDirs.length - 1;

	// Match all elements up to the first **
	while (patIdxStart <= patIdxEnd && strIdxStart <= strIdxEnd) {
		var patDir = patDirs[patIdxStart];
		if (patDir === "**") {
			break;
		}
		if (!matchStrings(patDir, strDirs[strIdxStart])) {
			return false;
		}
		patIdxStart++;
		strIdxStart++;
	}

	if (strIdxStart > strIdxEnd) {
		// String is exhausted, only match if rest of pattern is * or **'s
		if (patIdxStart == patIdxEnd && patDirs[patIdxStart] === "*" &&
				StringUtils.endsWith(str, pathSeparator)) {
			return true;
		}
		for (var i = patIdxStart; i <= patIdxEnd; i++) {
			if (!patDirs[i] === "**") {
				return false;
			}
		}
		return true;
	}
	else {
		if (patIdxStart > patIdxEnd) {
			// String not exhausted, but pattern is. Failure.
			return false;
		}
	}

	// up to last '**'
	while (patIdxStart <= patIdxEnd && strIdxStart <= strIdxEnd) {
		var patDir = patDirs[patIdxEnd];
		if (patDir === "**") {
			break;
		}
		if (!matchStrings(patDir, strDirs[strIdxEnd])) {
			return false;
		}
		patIdxEnd--;
		strIdxEnd--;
	}
	if (strIdxStart > strIdxEnd) {
		// String is exhausted
		for (var i = patIdxStart; i <= patIdxEnd; i++) {
			if (!patDirs[i] === "**") {
				return false;
			}
		}
		return true;
	}

	while (patIdxStart != patIdxEnd && strIdxStart <= strIdxEnd) {
		var patIdxTmp = -1;
		for (var i = patIdxStart + 1; i <= patIdxEnd; i++) {
			if (patDirs[i] === "**") {
				patIdxTmp = i;
				break;
			}
		}
		if (patIdxTmp == patIdxStart + 1) {
			// '**/**' situation, so skip one
			patIdxStart++;
			continue;
		}
		// Find the pattern between padIdxStart & padIdxTmp in str between
		// strIdxStart & strIdxEnd
		var patLength = (patIdxTmp - patIdxStart - 1);
		var strLength = (strIdxEnd - strIdxStart + 1);
		var foundIdx = -1;
		strLoop:
		    for (var i = 0; i <= strLength - patLength; i++) {
			    for (var j = 0; j < patLength; j++) {
				    var subPat = patDirs[patIdxStart + j + 1];
				    var subStr = strDirs[strIdxStart + i + j];
				    if (!matchStrings(subPat, subStr)) {
					    continue strLoop;
				    }
			    }

			    foundIdx = strIdxStart + i;
			    break;
		    }

		if (foundIdx == -1) {
			return false;
		}

		patIdxStart = patIdxTmp;
		strIdxStart = foundIdx + patLength;
	}

	for (var i = patIdxStart; i <= patIdxEnd; i++) {
		if (!patDirs[i] === "**") {
			return false;
		}
	}

	return true;
}

function matchStrings(pattern, str) {
	var patArr = pattern.split("");
	var strArr = str.split("");
	var patIdxStart = 0;
	var patIdxEnd = patArr.length - 1;
	var strIdxStart = 0;
	var strIdxEnd = strArr.length - 1;
	var ch;

	var containsStar = false;
	for (var i = 0; i < patArr.length; i++) {
		if (patArr[i] == '*') {
			containsStar = true;
			break;
		}
	}

	if (!containsStar) {
		// No '*'s, so we make a shortcut
		if (patIdxEnd != strIdxEnd) {
			return false; // Pattern and string do not have the same size
		}
		for (var i = 0; i <= patIdxEnd; i++) {
			ch = patArr[i];
			if (ch != '?') {
				if (ch != strArr[i]) {
					return false;// Character mismatch
				}
			}
		}
		return true; // String matches against pattern
	}


	if (patIdxEnd == 0) {
		return true; // Pattern contains only '*', which matches anything
	}

	// Process characters before first star
	while ((ch = patArr[patIdxStart]) != '*' && strIdxStart <= strIdxEnd) {
		if (ch != '?') {
			if (ch != strArr[strIdxStart]) {
				return false;// Character mismatch
			}
		}
		patIdxStart++;
		strIdxStart++;
	}
	if (strIdxStart > strIdxEnd) {
		// All characters in the string are used. Check if only '*'s are
		// left in the pattern. If so, we succeeded. Otherwise failure.
		for (var i = patIdxStart; i <= patIdxEnd; i++) {
			if (patArr[i] != '*') {
				return false;
			}
		}
		return true;
	}

	// Process characters after last star
	while ((ch = patArr[patIdxEnd]) != '*' && strIdxStart <= strIdxEnd) {
		if (ch != '?') {
			if (ch != strArr[strIdxEnd]) {
				return false;// Character mismatch
			}
		}
		patIdxEnd--;
		strIdxEnd--;
	}
	if (strIdxStart > strIdxEnd) {
		// All characters in the string are used. Check if only '*'s are
		// left in the pattern. If so, we succeeded. Otherwise failure.
		for (var i = patIdxStart; i <= patIdxEnd; i++) {
			if (patArr[i] != '*') {
				return false;
			}
		}
		return true;
	}

	// process pattern between stars. padIdxStart and patIdxEnd point
	// always to a '*'.
	while (patIdxStart != patIdxEnd && strIdxStart <= strIdxEnd) {
		var patIdxTmp = -1;
		for (var i = patIdxStart + 1; i <= patIdxEnd; i++) {
			if (patArr[i] == '*') {
				patIdxTmp = i;
				break;
			}
		}
		if (patIdxTmp == patIdxStart + 1) {
			// Two stars next to each other, skip the first one.
			patIdxStart++;
			continue;
		}
		// Find the pattern between padIdxStart & padIdxTmp in str between
		// strIdxStart & strIdxEnd
		var patLength = (patIdxTmp - patIdxStart - 1);
		var strLength = (strIdxEnd - strIdxStart + 1);
		var foundIdx = -1;
		strLoop:
		for (var i = 0; i <= strLength - patLength; i++) {
			for (var j = 0; j < patLength; j++) {
				ch = patArr[patIdxStart + j + 1];
				if (ch != '?') {
					if (ch != strArr[strIdxStart + i + j]) {
						continue strLoop;
					}
				}
			}

			foundIdx = strIdxStart + i;
			break;
		}

		if (foundIdx == -1) {
			return false;
		}

		patIdxStart = patIdxTmp;
		strIdxStart = foundIdx + patLength;
	}

	// All characters in the string are used. Check if only '*'s are left
	// in the pattern. If so, we succeeded. Otherwise failure.
	for (var i = patIdxStart; i <= patIdxEnd; i++) {
		if (patArr[i] != '*') {
			return false;
		}
	}

	return true;
}

if (!module.parent) {
	// TODO: need some unit testing framework
	console.log(match("**/*.js", "aria/test/text.js"), true);
	console.log(match("**/*.jss", "aria/test/text.js"), false);
	console.log(match("aria/core/**/*.js", "aria/core/text.js"), true);
	console.log(match("aria/core/**/*.js", "aria/core/transport/IO.js"), true);
	console.log(match("aria/core/**/*.js", "aria/core/transport/intf/IO.js"), true);
	console.log(match("aria/core/*.js", "aria/core/transport/intf/IO.js"), false);
	console.log(match("aria/core/*.js", "aria/core/IO.js"), true);
} else {
	module.exports.match = match;
}
