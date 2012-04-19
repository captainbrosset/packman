function clone(obj) {
    var newObject = {};
    var props = Object.getOwnPropertyNames(obj);
    props.forEach(function(name) {
        if(typeof obj[name] !== "object") {
            newObject[name] = obj[name];
        } else {
            newObject[name] = clone(obj[name]);
        }
    });
    return newObject;
};

module.exports.clone = clone;
