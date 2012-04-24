function sequence(functions, args, callback) {
    if(functions.length === 0) {
        callback();
    } else {
        var func = functions.splice(0, 1)[0];
        func.apply(null, args.concat([function() {
            sequence(functions, args, callback);
        }]));
    }
};

module.exports.sequence = sequence;