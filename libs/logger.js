function padTime(time) {
    time = time + "";
    return time.length == 1 ? "0" + time : time;
}

function formatMessage(message, level) {
    if(message === "") {
        return "";
    } else {
        /*var timestamp = new Date();
        var hours = padTime(timestamp.getHours());
        var minutes = padTime(timestamp.getMinutes());
        var seconds = padTime(timestamp.getSeconds());*/

        return /*"[" + hours + ":" + minutes + ":" + seconds + "] */"[" + level.toUpperCase().substring(0,4) + "] " + message;
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
