var fs = require('fs');
var solver = require('./solver.js');

var emptyBoard = [
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
];

var letterValues = {
  a: 1,
  b: 3,
  c: 3,
  d: 2,
  e: 1,
  f: 4,
  g: 2,
  h: 4,
  i: 1,
  j: 8,
  k: 5,
  l: 1,
  m: 3,
  n: 1,
  o: 1,
  p: 3,
  q: 10,
  r: 1,
  s: 1,
  t: 1,
  u: 1,
  v: 4,
  w: 4,
  x: 8,
  y: 4,
  z: 10
};

var Player = function(name, strategy) {
  this.name = name;
  this.score = 0;
  this.rack = [];
  this.strategy = strategy || 'points'; //"points" or "bonus", default "points"
};

var Game = function(board, player1, player2) {
  var self = this;

  self.board = board;
  self.players = [player1, player2];
  self.moveCount = 0;
  self.toMove = 0; //for now, player1 always goes first

  self.tileBag = {
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
  self.tileList = (function() {
    var tiles = [];
    var letters = Object.keys(self.tileBag);
    letters.forEach(function(c) {
      for (var i = 0; i < self.tileBag[c]; i++) {
        tiles.push(c);
      }
    });
    return tiles;
  })();
  self.tileCount = 98; //for now, no blank tiles

  self.isOver = false;

  self.emptyMoves = 0;

  self.pickTiles = function(num) {
    var tiles = [];

    if (num > self.tileCount) {
      num = self.tileCount;
    }

    while (num > 0) {
      var idx = Math.floor(Math.random() * self.tileList.length);
      var c = self.tileList[idx];
      tiles.push(c);
      self.tileBag[c]--;
      self.tileList.splice(idx, 1);
      self.tileCount--;
      num--;
    }
    return tiles;
  };

  self.makeMove = function() {
    var player = self.players[self.toMove];

    if (self.emptyMoves === 4) {
      self.isOver = true;
      return;
    }

    if (player.rack.length === 0 && self.tileCount === 0) {
      // self.emptyMoves++;
      // if (self.emptyMoves === 4) {
      //     self.isOver = true;
      // }
      self.isOver = true;
      return;
    }

    // console.log(player.name+" has rack ["+player.rack.join(",")+"].");

    var possibleMoves = solver.solve(self.board, player.rack.join(''), player.strategy);
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
        self.board[row][col] = c;

        if (move.direction === 'across') {
          col++;
        } else {
          row++;
        }
      }

      // console.log("The new board is...");
      // solver.print(self.board);

      //Pick new tiles for current player
      for (var i = 0; i < move.lettersUsed.length; i++) {
        var used = move.lettersUsed[i];
        player.rack.splice(player.rack.indexOf(used), 1);
      }

      var newTiles = self.pickTiles(7 - player.rack.length);

      // console.log("There are "+self.tileCount+" tiles left.");

      player.rack = player.rack.concat(newTiles);

      // console.log(player.name+" now has rack ["+player.rack.join(",")+"].");

      //Add the score for the current player
      player.score += move.score;

      self.emptyMoves = 0;
    } else {
      // console.log("No moves available! "+player.name+" passes.");
      self.emptyMoves++;
    }

    // console.log("Current score: "+self.players[0].name+": "+self.players[0].score+" | "+self.players[1].name+": "+self.players[1].score)

    //next player's up
    self.toMove = self.toMove === 0 ? 1 : 0;

    self.moveCount++;
  };

  self.endGame = function() {
    for (var i = 0; i < self.players[0].rack.length; i++) {
      var c = self.players[0].rack[i];
      self.players[0].score -= letterValues[c];
      self.players[1].score += letterValues[c];
    }
    for (var i = 0; i < self.players[1].rack.length; i++) {
      var c = self.players[1].rack[i];
      self.players[1].score -= letterValues[c];
      self.players[0].score += letterValues[c];
    }

    var winner = -1;
    var winMessage;
    if (self.players[0].score > self.players[1].score) {
      winner = 0;
      winMessage = self.players[0].name + ' wins!!';
    } else if (self.players[1].score > self.players[0].score) {
      winner = 1;
      winMessage = self.players[1].name + ' wins!!';
    } else {
      winner = 2;
      winMessage = "It's a draw!";
    }

    console.log(
      winMessage +
        ' Final score: ' +
        self.players[0].name +
        ': ' +
        self.players[0].score +
        ' | ' +
        self.players[1].name +
        ': ' +
        self.players[1].score
    );

    return {
      winner: winner,
      scores: [self.players[0].score, self.players[1].score]
    };
  };

  self.players[0].rack = self.pickTiles(7);
  self.players[1].rack = self.pickTiles(7);
};

var GameSet = function(player1, player2, numGames) {
  var self = this;

  self.players = [player1, player2];
  self.numGames = numGames;
  self.scoreHistory = [[], []];
  self.scoreSums = [0, 0];
  self.highScores = [0, 0];
  self.lowScores = [9999, 9999];
  self.winCounts = [0, 0];
  self.drawCount = 0;

  self.run = function() {
    for (var i = 1; i <= self.numGames; i++) {
      var p1 = new Player(self.players[0].name, self.players[0].strategy);
      var p2 = new Player(self.players[1].name, self.players[1].strategy);

      var board = emptyBoard.map(function(a) {
        return a.map(function(c) {
          return c;
        });
      });

      var g;
      if (i % 2 === 0) {
        g = new Game(board, p1, p2);
      } else {
        g = new Game(board, p2, p1);
      }
      while (!g.isOver) {
        g.makeMove();
      }
      var results = g.endGame();

      if (i % 2 === 0) {
        self.scoreHistory[0].push(results.scores[0]);
        self.scoreSums[0] += results.scores[0];
        self.scoreHistory[1].push(results.scores[1]);
        self.scoreSums[1] += results.scores[1];

        if (results.scores[0] < self.lowScores[0]) {
          self.lowScores[0] = results.scores[0];
        }
        if (results.scores[1] < self.lowScores[1]) {
          self.lowScores[1] = results.scores[1];
        }
        if (results.scores[0] > self.highScores[0]) {
          self.highScores[0] = results.scores[0];
        }
        if (results.scores[1] > self.highScores[1]) {
          self.highScores[1] = results.scores[1];
        }

        if (results.winner === 2) {
          self.drawCount++;
        } else if (results.winner === 0) {
          self.winCounts[0]++;
        } else {
          self.winCounts[1]++;
        }
      } else {
        self.scoreHistory[1].push(results.scores[0]);
        self.scoreSums[1] += results.scores[0];
        self.scoreHistory[0].push(results.scores[1]);
        self.scoreSums[0] += results.scores[1];

        if (results.scores[0] < self.lowScores[1]) {
          self.lowScores[1] = results.scores[0];
        }
        if (results.scores[1] < self.lowScores[0]) {
          self.lowScores[0] = results.scores[1];
        }
        if (results.scores[0] > self.highScores[1]) {
          self.highScores[1] = results.scores[0];
        }
        if (results.scores[1] > self.highScores[0]) {
          self.highScores[0] = results.scores[1];
        }

        if (results.winner === 2) {
          self.drawCount++;
        } else if (results.winner === 0) {
          self.winCounts[1]++;
        } else {
          self.winCounts[0]++;
        }
      }
      console.log('completed game ' + i + ' of ' + self.numGames);
    }
    self.finishSet();
  };

  self.finishSet = function() {
    var avg0 = self.scoreSums[0] / self.scoreHistory[0].length;
    var avg1 = self.scoreSums[1] / self.scoreHistory[1].length;
    console.log('         | ' + self.players[0].name + ' | ' + self.players[1].name);
    console.log('wins     |   ' + self.winCounts[0] + '   |   ' + self.winCounts[1]);
    console.log('draws    |   ' + self.drawCount + '   |   ' + self.drawCount);
    console.log('mean     |   ' + avg0 + '   |   ' + avg1);
    console.log('hi score |   ' + self.highScores[0] + '   |   ' + self.highScores[1]);
    console.log('lo score |   ' + self.lowScores[0] + '   |   ' + self.lowScores[1]);
  };
};

var board = emptyBoard;

// board = fs.readFileSync('input.board', 'utf8').split('\n').map(function(line) {
//     return line.split("").map(function(chr) {
//         return chr === "." ? "" : chr.toLowerCase();
//     });
// });

var rack = 'parents';

var gs = new GameSet(new Player('Reid', 'bonus'), new Player('Jim', 'bonus'), 1000);
gs.run();

// var g = new Game(board, new Player("Reid", "bonus"), new Player("Jim", "points"));

// while (!g.isOver) {
//     g.makeMove();
// }
// g.endGame();

// solver.print(board);

// solver.solve(board, rack, "bonus");
