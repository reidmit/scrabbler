const solver = require('./solver');
const { letterValues } = require('./constants');

class Game {
  constructor(board, player1, player2) {
    this.board = board;
    this.players = [player1, player2];
    this.moveCount = 0;
    this.toMove = 0; //for now, player1 always goes first

    // For now, no blank tiles
    this.tileBag = {
      a: 9,
      b: 2,
      c: 2,
      d: 4,
      e: 12,
      f: 2,
      g: 3,
      h: 2,
      i: 9,
      j: 1,
      k: 1,
      l: 4,
      m: 2,
      n: 6,
      o: 8,
      p: 2,
      q: 1,
      r: 6,
      s: 4,
      t: 6,
      u: 4,
      v: 2,
      w: 2,
      x: 1,
      y: 4,
      z: 1
    };

    this.tileList = Object.keys(this.tileBag).reduce((tiles, letter) => {
      const letterCount = this.tileBag[letter];
      for (var i = 0; i < letterCount; i++) tiles.push(letter);
      return tiles;
    }, []);

    this.tileCount = this.tileList.length;
    this.isOver = false;
    this.emptyMoves = 0;

    this.players[0].rack = this.pickTiles(7);
    this.players[1].rack = this.pickTiles(7);
  }

  pickTiles(num) {
    var tiles = [];

    if (num > this.tileCount) {
      num = this.tileCount;
    }

    while (num > 0) {
      var idx = Math.floor(Math.random() * this.tileList.length);
      var c = this.tileList[idx];
      tiles.push(c);
      this.tileBag[c]--;
      this.tileList.splice(idx, 1);
      this.tileCount--;
      num--;
    }
    return tiles;
  }

  makeMove() {
    var player = this.players[this.toMove];

    if (this.emptyMoves === 4) {
      this.isOver = true;
      return;
    }

    if (player.rack.length === 0 && this.tileCount === 0) {
      // this.emptyMoves++;
      // if (this.emptyMoves === 4) {
      //     this.isOver = true;
      // }
      this.isOver = true;
      return;
    }

    // console.log(player.name+" has rack ["+player.rack.join(",")+"].");

    var possibleMoves = solver.solve(this.board, player.rack.join(''), player.strategy);
    // console.log(possibleMoves);

    if (possibleMoves.length > 0) {
      //already sorted, so choose the best one (per this player's strategy)
      var move = possibleMoves[0];

      // console.log(player.name+" plays '"+move.word+"' for "+move.score+" points.");

      //Update the game board
      var row = move.row;
      var col = move.col;
      for (var i = 0; i < move.word.length; i++) {
        var c = move.word[i];
        this.board[row][col] = c;

        if (move.direction === 'across') {
          col++;
        } else {
          row++;
        }
      }

      // console.log("The new board is...");
      // solver.print(this.board);

      //Pick new tiles for current player
      for (var i = 0; i < move.lettersUsed.length; i++) {
        var used = move.lettersUsed[i];
        player.rack.splice(player.rack.indexOf(used), 1);
      }

      var newTiles = this.pickTiles(7 - player.rack.length);

      // console.log("There are "+this.tileCount+" tiles left.");

      player.rack = player.rack.concat(newTiles);

      // console.log(player.name+" now has rack ["+player.rack.join(",")+"].");

      //Add the score for the current player
      player.score += move.score;

      this.emptyMoves = 0;
    } else {
      // console.log("No moves available! "+player.name+" passes.");
      this.emptyMoves++;
    }

    // console.log("Current score: "+this.players[0].name+": "+this.players[0].score+" | "+this.players[1].name+": "+this.players[1].score)

    //next player's up
    this.toMove = this.toMove === 0 ? 1 : 0;

    this.moveCount++;
  }

  endGame() {
    for (let i = 0; i < this.players[0].rack.length; i++) {
      const c = this.players[0].rack[i];
      this.players[0].score -= letterValues[c];
      this.players[1].score += letterValues[c];
    }

    for (let i = 0; i < this.players[1].rack.length; i++) {
      const c = this.players[1].rack[i];
      this.players[1].score -= letterValues[c];
      this.players[0].score += letterValues[c];
    }

    var winner = -1;
    var winMessage;
    if (this.players[0].score > this.players[1].score) {
      winner = 0;
      winMessage = this.players[0].name + ' wins!!';
    } else if (this.players[1].score > this.players[0].score) {
      winner = 1;
      winMessage = this.players[1].name + ' wins!!';
    } else {
      winner = 2;
      winMessage = "It's a draw!";
    }

    console.log(
      winMessage +
        ' Final score: ' +
        this.players[0].name +
        ': ' +
        this.players[0].score +
        ' | ' +
        this.players[1].name +
        ': ' +
        this.players[1].score
    );

    return {
      winner: winner,
      scores: [this.players[0].score, this.players[1].score]
    };
  }
}

module.exports = Game;
