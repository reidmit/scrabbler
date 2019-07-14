class AnchorSet {
  constructor(initValues) {
    this.data = [];
    this.hashMap = {};

    if (initValues) {
      this.addAll(initValues);
    }
  }

  addAll(values) {
    for (let i = 0; i < values.length; i++) {
      this.add(values[i]);
    }
  }

  add(value) {
    if (this.contains(value)) return;

    this.data.push(value);
    this.hashMap[value] = this.data.length - 1;
  }

  size() {
    return this.data.length;
  }

  isEmpty() {
    return this.data.length === 0;
  }

  contains(value) {
    return this.hashMap.hasOwnProperty(value);
  }

  toList() {
    return this.data;
  }
}

module.exports = AnchorSet;
