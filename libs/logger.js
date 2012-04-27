
function padTime(time) {
    time = time + "";
    return time.length == 1 ? "0" + time : time;
}

var levelSize = 3;

function formatMessage(message, level) {
    if(message === "") {
        return "";
    } else {
        if(level === "log")   message = message.bold.grey;
        if(level === "info")   message = message.bold.cyan;
        if(level === "warn")   message = message.bold.yellow;
        if(level === "error")   message = message.bold.red;

        message = " [" + level.toUpperCase().substring(0, levelSize) + "] " + message;

        return message;
    }
}

function log(message, level, e) {
    var logFunction = console.log;
    if(console[level]) {
        logFunction = console[level];
    }

    if(e)   logFunction(formatMessage(message, level), e);
    else    logFunction(formatMessage(message, level));
}

global.logger = {};
global.logger.level = 1;
global.logger.logDebug = function(message) {
    if(global.logger.level >= 4) log(message, "log");
};
global.logger.logInfo = function(message) {
    if(global.logger.level >= 3) log(message, "info");
};
global.logger.logWarning = function(message, e) {
    if(global.logger.level >= 2) log(message, "warn", e);
};
global.logger.logError = function(message, e) {
    if(global.logger.level >= 1) log(message, "error", e);
};
