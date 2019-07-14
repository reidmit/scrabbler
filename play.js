const solver = require('./solver');
const { emptyBoard, letterValues } = require('./constants');

class Player {
  constructor(name, strategy) {
    this.name = name;
    this.score = 0;
    this.rack = [];
    this.strategy = strategy || 'points'; //"points" or "bonus", default "points"
  }
}

class Game {
  constructor(board, player1, player2) {
    this.board = board;
    this.players = [player1, player2];
    this.moveCount = 0;
    this.toMove = 0; //for now, player1 always goes first

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

    this.tileList = (() => {
      var tiles = [];
      var letters = Object.keys(this.tileBag);
      letters.forEach(c => {
        for (var i = 0; i < this.tileBag[c]; i++) {
          tiles.push(c);
        }
      });
      return tiles;
    })();

    this.tileCount = 98; //for now, no blank tiles
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
      const p1 = new Player(this.players[0].name, this.players[0].strategy);
      const p2 = new Player(this.players[1].name, this.players[1].strategy);
      const board = emptyBoard.map(a => a.map(c => c));

      let g;
      if (i % 2 === 0) {
        g = new Game(board, p1, p2);
      } else {
        g = new Game(board, p2, p1);
      }

      while (!g.isOver) {
        g.makeMove();
      }

      const results = g.endGame();

      if (i % 2 === 0) {
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

    console.log('         | ' + this.players[0].name + ' | ' + this.players[1].name);
    console.log('wins     |   ' + this.winCounts[0] + '   |   ' + this.winCounts[1]);
    console.log('draws    |   ' + this.drawCount + '   |   ' + this.drawCount);
    console.log('mean     |   ' + avg0 + '   |   ' + avg1);
    console.log('hi score |   ' + this.highScores[0] + '   |   ' + this.highScores[1]);
    console.log('lo score |   ' + this.lowScores[0] + '   |   ' + this.lowScores[1]);
  }
}

const gameSet = new GameSet(new Player('Reid', 'bonus'), new Player('Jim', 'bonus'), 1);
gameSet.run();
