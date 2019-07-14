const Player = require('./player');
const Game = require('./game');
const { emptyBoard } = require('./constants');

class GameSet {
  constructor(player1, player2, numGames) {
    this.players = [player1, player2];
    this.numGames = numGames;
    this.scoreHistory = [[], []];
    this.scoreSums = [0, 0];
    this.highScores = [0, 0];
    this.lowScores = [9999, 9999];
    this.winCounts = [0, 0];
    this.drawCount = 0;
  }

  run() {
    for (let i = 1; i <= this.numGames; i++) {
      const isEvenGame = i % 2 === 0;

      const p1 = new Player(this.players[0].name, this.players[0].strategy);
      const p2 = new Player(this.players[1].name, this.players[1].strategy);
      const board = emptyBoard.map(a => a.map(c => c));

      const g = isEvenGame ? new Game(board, p1, p2) : new Game(board, p2, p1);
      const results = g.finish();

      if (isEvenGame) {
        this.scoreHistory[0].push(results.scores[0]);
        this.scoreSums[0] += results.scores[0];
        this.scoreHistory[1].push(results.scores[1]);
        this.scoreSums[1] += results.scores[1];

        if (results.scores[0] < this.lowScores[0]) {
          this.lowScores[0] = results.scores[0];
        }

        if (results.scores[1] < this.lowScores[1]) {
          this.lowScores[1] = results.scores[1];
        }

        if (results.scores[0] > this.highScores[0]) {
          this.highScores[0] = results.scores[0];
        }

        if (results.scores[1] > this.highScores[1]) {
          this.highScores[1] = results.scores[1];
        }

        if (results.winner === 2) {
          this.drawCount++;
        } else if (results.winner === 0) {
          this.winCounts[0]++;
        } else {
          this.winCounts[1]++;
        }
      } else {
        this.scoreHistory[1].push(results.scores[0]);
        this.scoreSums[1] += results.scores[0];
        this.scoreHistory[0].push(results.scores[1]);
        this.scoreSums[0] += results.scores[1];

        if (results.scores[0] < this.lowScores[1]) {
          this.lowScores[1] = results.scores[0];
        }

        if (results.scores[1] < this.lowScores[0]) {
          this.lowScores[0] = results.scores[1];
        }

        if (results.scores[0] > this.highScores[1]) {
          this.highScores[1] = results.scores[0];
        }

        if (results.scores[1] > this.highScores[0]) {
          this.highScores[0] = results.scores[1];
        }

        if (results.winner === 2) {
          this.drawCount++;
        } else if (results.winner === 0) {
          this.winCounts[1]++;
        } else {
          this.winCounts[0]++;
        }
      }

      console.log('completed game ' + i + ' of ' + this.numGames);
    }

    this.finishSet();
  }

  finishSet() {
    const avg0 = this.scoreSums[0] / this.scoreHistory[0].length;
    const avg1 = this.scoreSums[1] / this.scoreHistory[1].length;

    console.log('         |   ' + this.players[0].name + ' | ' + this.players[1].name);
    console.log('wins     |   ' + this.winCounts[0] + '   |   ' + this.winCounts[1]);
    console.log('draws    |   ' + this.drawCount + '   |   ' + this.drawCount);
    console.log('mean     |   ' + avg0 + '   |   ' + avg1);
    console.log('hi score |   ' + this.highScores[0] + '   |   ' + this.highScores[1]);
    console.log('lo score |   ' + this.lowScores[0] + '   |   ' + this.lowScores[1]);
  }
}

module.exports = GameSet;
