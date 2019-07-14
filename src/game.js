const solver = require('./solver');
const { letterValues, initialTileBag } = require('./constants');

class Game {
  constructor(board, player1, player2) {
    this.board = board;
    this.players = [player1, player2];
    this.moveCount = 0;
    this.toMove = 0; // for now, player1 always goes first

    this.tileBag = Object.keys(initialTileBag).reduce((acc, key) => {
      return { ...acc, [key]: initialTileBag[key] };
    }, {});

    this.tileList = Object.keys(this.tileBag).reduce((tiles, letter) => {
      const letterCount = this.tileBag[letter];
      for (let i = 0; i < letterCount; i++) tiles.push(letter);
      return tiles;
    }, []);

    this.tileCount = this.tileList.length;
    this.isOver = false;
    this.consecutiveSkippedTurnCount = 0;

    this.players[0].rack = this.pickTiles(7);
    this.players[1].rack = this.pickTiles(7);
  }

  pickTiles(num) {
    const tiles = [];

    if (num > this.tileCount) {
      num = this.tileCount;
    }

    while (num > 0) {
      const idx = Math.floor(Math.random() * this.tileList.length);
      const tile = this.tileList[idx];

      tiles.push(tile);
      this.tileBag[tile]--;
      this.tileList.splice(idx, 1);
      this.tileCount--;
      num--;
    }

    return tiles;
  }

  makeMove() {
    const player = this.players[this.toMove];

    if (this.consecutiveSkippedTurnCount === 4) {
      this.isOver = true;
      return;
    }

    if (player.rack.length === 0 && this.tileCount === 0) {
      this.isOver = true;
      return;
    }

    const rankedPossibleMoves = solver.solve(this.board, player.rack.join(''), player.strategy);

    if (rankedPossibleMoves.length > 0) {
      const move = rankedPossibleMoves[0];

      player.score += move.score;

      let { row, col } = move;
      for (let i = 0; i < move.word.length; i++) {
        this.board[row][col] = move.word[i];
        if (move.direction === 'across') col++;
        else row++;
      }

      for (let i = 0; i < move.lettersUsed.length; i++) {
        const used = move.lettersUsed[i];
        player.rack.splice(player.rack.indexOf(used), 1);
      }

      const newTiles = this.pickTiles(7 - player.rack.length);
      player.rack.push(...newTiles);

      this.consecutiveSkippedTurnCount = 0;
    } else {
      this.consecutiveSkippedTurnCount++;
    }

    this.toMove = this.toMove === 0 ? 1 : 0;
    this.moveCount++;
  }

  endGame() {
    const [player1, player2] = this.players;

    for (let i = 0; i < player1.rack.length; i++) {
      const c = player1.rack[i];
      player1.score -= letterValues[c];
      player2.score += letterValues[c];
    }

    for (let i = 0; i < player2.rack.length; i++) {
      const c = player2.rack[i];
      player2.score -= letterValues[c];
      player1.score += letterValues[c];
    }

    var winner = -1;
    var winMessage;
    if (player1.score > player2.score) {
      winner = 0;
      winMessage = player1.name + ' wins!';
    } else if (player2.score > player1.score) {
      winner = 1;
      winMessage = player2.name + ' wins!';
    } else {
      winner = 2;
      winMessage = "It's a draw!";
    }

    console.log(
      winMessage +
        ' Final score: ' +
        player1.name +
        ': ' +
        player1.score +
        ' | ' +
        player2.name +
        ': ' +
        player2.score
    );

    return {
      winner: winner,
      scores: [player1.score, player2.score]
    };
  }

  finish() {
    while (!this.isOver) this.makeMove();
    return this.endGame();
  }
}

module.exports = Game;
