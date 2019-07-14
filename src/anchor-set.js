class AnchorSet {
  constructor() {
    this.data = [];
    this.hashMap = {};
  }

  add(value) {
    if (this.contains(value)) return;

    this.data.push(value);
    this.hashMap[value] = this.data.length - 1;
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
