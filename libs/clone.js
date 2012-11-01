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

function cloneArray(array) {
  var a = [];
  for(var i = 0, l = array.length; i < l; i++) {
    a.push(array[i]);
  }
  return a;
}

module.exports.clone = clone;
module.exports.cloneArray = cloneArray;