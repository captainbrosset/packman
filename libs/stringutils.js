module.exports.startsWith = function(string, start) {
    return string.substring(0, start.length) === start;
};
module.exports.endsWith = function(string, end) {
    return string.substring(string.length - end.length) === end;
};
module.exports.isBlank = function(string) {
    return string.replace(/\s/g, "") === "";
};