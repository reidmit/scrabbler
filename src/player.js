class Player {
  constructor(name, strategy) {
    this.name = name;
    this.score = 0;
    this.rack = [];
    this.strategy = strategy || 'points'; //"points" or "bonus", default "points"
  }
}

module.exports = Player;
