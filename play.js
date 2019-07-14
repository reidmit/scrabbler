const Player = require('./player');
const GameSet = require('./game-set');

const p1 = new Player('Reid', 'bonus');
const p2 = new Player('Jim', 'bonus');
const gameSet = new GameSet(p1, p2, 1);

gameSet.run();
