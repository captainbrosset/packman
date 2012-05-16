module.exports = function(yaml, mockLogger) {
    yaml = yaml || require('js-yaml');
    var myLogger = mockLogger || logger;

    function toJs(yamlText) {
        try {
            return yaml.load(yamlText);
        } catch(e) {
            var msg = "Could not parse the YAML configuration file (";
            if(e.context && e.contextMark) {
                msg += e.context + " line " + e.contextMark.line + " column " + e.contextMark.column + " : ";
            }
            if(e.problemMark) {
                msg += "line " + e.problemMark.line + " column " + e.problemMark.column + " : ";
            }
            msg += e.problem + ")";
            myLogger.logError(msg);
            return null;
        }
    };

    return {
        toJs: toJs
    };
};
