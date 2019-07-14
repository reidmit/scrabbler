/*
A set data structure (doesn't allow duplicates)
*/

var Set = function(initValues) {
  var data = [];
  var hashMap = {};

  this.addAll = function(values) {
    for (var i = 0; i < values.length; i++) {
      this.add(values[i]);
    }
  };

  this.add = function(value) {
    if (hashMap.hasOwnProperty(value)) {
      return;
    }
    data.push(value);
    hashMap[value] = data.length - 1;
  };

  this.size = function() {
    return data.length;
  };

  this.isEmpty = function() {
    return data.length === 0;
  };

  this.contains = function(value) {
    return hashMap.hasOwnProperty(value);
  };

  this.toList = function() {
    return data;
  };

  if (initValues) {
    this.addAll(initValues);
  }
};

module.exports = Set;
