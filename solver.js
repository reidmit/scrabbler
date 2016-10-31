var Set = require('./set.js');
var dict = require('./dict.json');
var colors = require('colors/safe');
var fs = require('fs');
var module = module || {};

var letterValues = {
    a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4,  i: 1,
    j: 8, k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1,
    s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10
}

var mode = "wwf" // "scrabble" or "wwf"
var mult = require('./multipliers.js')[mode];

var rackSize = 7;

var bingoBonus = 50;

function trieSearch(root, word) {
    var node = root;
    for (var i=0; i<word.length; i++) {
        var c = word.charAt(i);
        if (!node[c]) {
            return false;
        } else {
            node = node[c];
        }
    }
    return node.$ === 1;
}

function normalize(word) {
    return word.toLowerCase().split("")
                .filter(function(letter) {
                    return /[a-z]/.test(letter);
                }).join("");
}

function isEmpty(cell) {
    return cell.length === 0;
}

var emptyBoard = [
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], /* board[0][14] */
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]  /* board[14][14] */
];
var boardSize = emptyBoard.length;
var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

var forEachCell = function(fun) {
    for (var i=0; i<board.length; i++) {
        for (var j=0; j<board[0].length; j++) {
            fun(board[i][j], i, j);
        }
    }
}

function printBoard(b) {
    var aux = [" ","0","1","2","3","4","5","6","7","8","9","A","B","C","D","E"]
                .map(function (c) { return colors.bold.yellow(c); });
    var topRow = colors.yellow("╔═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╗");
    var sepRow = colors.yellow("╟───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───╢");
    var botRow = colors.yellow("╚═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╝");
    var tileInfo = [
        colors.bold("letter values"),
        "A: "+letterValues.a+"   "+"N: "+letterValues.n,
        "B: "+letterValues.b+"   "+"O: "+letterValues.o,
        "C: "+letterValues.c+"   "+"P: "+letterValues.p,
        "D: "+letterValues.d+"   "+"Q: "+letterValues.q,
        "E: "+letterValues.e+"   "+"R: "+letterValues.r,
        "F: "+letterValues.f+"   "+"S: "+letterValues.s,
        "G: "+letterValues.g+"   "+"T: "+letterValues.t,
        "H: "+letterValues.h+"   "+"U: "+letterValues.u,
        "I: "+letterValues.i+"   "+"V: "+letterValues.v,
        "J: "+letterValues.j+"   "+"W: "+letterValues.w,
        "K: "+letterValues.k+"   "+"X: "+letterValues.x,
        "L: "+letterValues.l+"   "+"Y: "+letterValues.y,
        "M: "+letterValues.m+"   "+"Z: "+letterValues.z
    ]

    console.log(topRow);
    console.log(colors.yellow("║ ")+aux.join(colors.yellow(" │ "))+colors.yellow(" ║"));
    console.log(sepRow);
    var c = 0;
    for (var i=0; i<b.length; i++) {
        var j = -1;
        var row = b[i].map(function(c) {
            j++;
            if (c.length===0) {
                if (mult.letter[i][j] === 2)
                    return colors.blue(" ⁚ ");
                if (mult.letter[i][j] === 3)
                    return colors.blue(" ⁖ ");
                if (mult.word[i][j] === 2)
                    return colors.red(" ⁚ ");
                if (mult.word[i][j] === 3)
                    return colors.red(" ⁖ ");
                return "   ";
            }
            return " "+c.toUpperCase()+" ";
        });
        var label = aux[i+1]
        if (c < tileInfo.length)
            console.log(colors.yellow("║ ")+label+colors.yellow(" │")+row.join(colors.yellow("│"))+colors.yellow("║")+"  "+tileInfo[c++]);
        else
            console.log(colors.yellow("║ ")+label+colors.yellow(" │")+row.join(colors.yellow("│"))+colors.yellow("║"));

        if (i !== b.length-1) {
            if (c < tileInfo.length)
                console.log(sepRow+"  "+tileInfo[c++]);
            else
                console.log(sepRow);
        }
    }
    console.log(botRow);
}

/* Given a board and a row, compute the crosschecks for the row.
   We also compute the additional score for each crosscheck. */
function computeCrossChecks(board, row) {
    var rowData = [];
    var alphabetAllZeros = alphabet.reduce(function(obj,char) {
        obj[char] = 0;
        return obj;
    },{});

    for (var col=0; col<board[row].length; col++) {

        //If the squares directly above and below this one are empty,
        //then any letter could be valid here (crosschecks = whole alphabet)

        if ( (row === 0 || isEmpty(board[row-1][col]) ) &&
             (row === board.length-1 || isEmpty(board[row+1][col]) ) ) {
            rowData[col] = alphabetAllZeros;
            continue;
        }

        //If this square is not empty, we shouldn't have any crosschecks for
        //it (since we can't place anything there).
        if (!isEmpty(board[row][col])) {
            rowData[col] = {};
            continue;
        }

        var letters = {};
        var crossScore = 0;
        var above = "";
        var x = row-1;
        while (x >= 0 && !isEmpty(board[x][col])) {
            above = board[x][col] + above;
            crossScore += letterValues[ board[x][col] ];
            x--;
        }
        var below = "";
        x = row+1;
        while (x < boardSize && !isEmpty(board[x][col])) {
            below += board[x][col];
            crossScore += letterValues[ board[x][col] ];
            x++;
        }

        alphabet.forEach(function(letter) {
            var candidateWord = above+letter+below;
            if (trieSearch(dict,candidateWord)) {
                var wordScore = (crossScore + (letterValues[letter] * mult.letter[row][col])) * mult.word[row][col];
                letters[letter] = wordScore;
            }
        });
        rowData[col] = letters;
    }
    return rowData;
}


//Find all empty squares adjacent to filled squares IN A SINGLE ROW,
//given an array of filled squares (each represented
//as a two-element array), a game board, and a row
function findAnchorSquares(board, row) {
    var max = board.length;
    var anchors = new Set();
    for (var col=0; col<board[row].length; col++) {
        if (isEmpty(board[row][col])) {
            if ((col+1 < max && !isEmpty(board[row][col+1])) ||
                (col-1 >= 0  && !isEmpty(board[row][col-1])) ||
                (row-1 >= 0  && !isEmpty(board[row-1][col])) ||
                (row+1 < max && !isEmpty(board[row+1][col]))) {
                anchors.add([row,col]);
            }
        }
    }
    return anchors;
}

function arrayContainsPair(array,pair) {
    var fst = pair[0];
    var snd = pair[1];
    for (var i=0; i<array.length; i++) {
        if (array[i][0] && array[i][1] &&
            array[i][0]===fst && array[i][1]===snd) {
            return true;
        }
    }
    return false;
}

function scoreWord(board, word, direction, startRow, startCol, rowData) {
    var row = startRow;
    var col = startCol;
    var sum = 0;
    var wordMult = 1;
    var crossSums = 0;
    var placedLetters = 0;
    var bonusSquareCount = 0;
    var bonusSquareScore = 0;

    for (var i=0; i<word.length; i++) {
        //calculate main word

        //we only get bonus squares for a letter if it's a letter that
        //we're putting down this turn
        if (isEmpty(board[row][col])) {
            var letterBonus = mult.letter[row][col];
            var wordBonus = mult.word[row][col]
            sum += letterValues[ word[i] ] * letterBonus;
            wordMult *= wordBonus;
            placedLetters++;
            if (wordBonus > 1) {
                bonusSquareCount++;
                bonusSquareScore += wordBonus*2; //TODO: is this the best formula?
            } else if (letterBonus > 1) {
                bonusSquareCount++;
                bonusSquareScore += letterBonus; //TODO: ... here too
            }
        } else {
            sum += letterValues[ word[i] ];
        }

        //CROSS WORDS! we already found the value of each possible
        //crosscheck when we computed the crosschecks
        if (rowData[col][word[i]] && isEmpty(board[row][col])) {
            crossSums += rowData[col][word[i]];
        }

        col++;
    }
    sum *= wordMult;
    sum += crossSums;
    if (placedLetters === rackSize) {
        sum += bingoBonus;
    }
    return {
        points: sum,
        lettersUsedCount: placedLetters,
        bonusSquareCount: bonusSquareCount,
        bonusSquareScore: bonusSquareScore
    };
}

var legalMoves = [];

function leftPart(board, rowData, partialWord, trieNode, limit, anchorRowCol, rack, direction, lettersUsed) {
    // console.log("in leftPart with anchor "+anchorRowCol+", partialWord is "+partialWord);

    //if there are already things to the left of this anchor square,
    //we just collect the letters already placed, traverse down the trie
    //accordingly, and call extendRight with the same rack
    if (anchorRowCol[1] > 0 && !isEmpty(board[ anchorRowCol[0] ][ anchorRowCol[1]-1 ])) {

        var currCol = anchorRowCol[1]-limit;
        var startSquare = board[ anchorRowCol[0] ][ currCol ];
        var currNode = trieNode;
        var newWord = partialWord;
        while (currCol < anchorRowCol[1]) {
            var c = board[ anchorRowCol[0] ][ currCol ];
            newWord += c;
            currNode = currNode[c];
            currCol++;
        }
        //TODO: might not need to check if isEmpty(rack) here
        if (!isEmpty(rack)) {
            extendRight(board, rowData, newWord, currNode, anchorRowCol, rack, direction, false, lettersUsed);
        }
        return;
    }
    if (!isEmpty(rack)) {
        // console.log("calling extendRight with partialWord "+partialWord+", rack is "+rack+", anchor is "+anchorRowCol.join(",")); //correct behavior
        extendRight(board, rowData, partialWord, trieNode, anchorRowCol, rack, direction, false, lettersUsed);
    }
    if (limit > 0) {
        var keys = Object.keys(trieNode);
        for (var i=0; i<keys.length; i++) {
            var l = keys[i];
            if (l !== "$" && typeof trieNode[l] !== "function") {
                if (rack.indexOf(l) > -1) {
                    leftPart(board, rowData,
                             partialWord+l,
                             trieNode[l],
                             limit-1,
                             anchorRowCol,
                             rack.replace(l,""),
                             direction,
                             lettersUsed+l)
                }
            }
        }
    }
}

function extendRight(board, rowData, partialWord, trieNode, square, rack, direction, canEndHere, lettersUsed) {
    if (square[1] >= board[0].length) {
        if (trieNode.$ && canEndHere) {
            var startRow = direction === "down" ? square[1]-partialWord.length : square[0];
            var startCol = direction === "down" ? square[0] : square[1]-partialWord.length;
            var scoreResults = scoreWord(board, partialWord, direction, square[0], square[1]-partialWord.length, rowData);
            legalMoves.push({
                row: startRow,
                col: startCol,
                word: partialWord,
                direction: direction,
                score: scoreResults.points,
                lettersUsedCount: scoreResults.lettersUsedCount,
                lettersUsed: lettersUsed,
                bonusSquareScore: scoreResults.bonusSquareScore,
                bonusSquareCount: scoreResults.bonusSquareCount
            });
        }
        return;
    }

    if (isEmpty(board[ square[0] ][ square[1] ])) {
        if (trieNode.$ && canEndHere) {
            var startRow = direction === "down" ? square[1]-partialWord.length : square[0];
            var startCol = direction === "down" ? square[0] : square[1]-partialWord.length;
            var scoreResults = scoreWord(board, partialWord, direction, square[0], square[1]-partialWord.length, rowData);
            legalMoves.push({
                row: startRow,
                col: startCol,
                word: partialWord,
                direction: direction,
                score: scoreResults.points,
                lettersUsedCount: scoreResults.lettersUsedCount,
                lettersUsed: lettersUsed,
                bonusSquareScore: scoreResults.bonusSquareScore,
                bonusSquareCount: scoreResults.bonusSquareCount
            });
        }
        var keys = Object.keys(trieNode);
        for (var i=0; i<keys.length; i++) {
            var l = keys[i];
            if (l !== "$" && typeof trieNode[l] !== "function") {
                //ensure we have the letter in our rack
                if (rack.indexOf(l) > -1) {

                    //ensure that the letter is in the set of valid crosschecks for this row,col
                    if (Object.keys(rowData[ square[1] ]).indexOf(l) > -1) {
                            extendRight(board, rowData,
                                    partialWord+l,
                                    trieNode[l],
                                    [square[0],square[1]+1],
                                    rack.replace(l,""),
                                    direction,
                                    true,
                                    lettersUsed+l)
                    }

                }
            }
        }
    } else {
        var l = board[ square[0] ][ square[1] ];
        if (trieNode[l]) {
            extendRight(board, rowData,
                        partialWord+l,
                        trieNode[l],
                        [ square[0], square[1]+1 ],
                        rack,
                        direction,
                        true,
                        lettersUsed)
        }
    }
}

function transpose(board) {
    var newBoard = [[],[],[],[],[],
                    [],[],[],[],[],
                    [],[],[],[],[]];
    for (var i=0; i<board.length; i++) {
        for (var j=0; j<board[0].length; j++) {
            newBoard[j][i] = board[i][j];
        }
    }
    return newBoard;
}

function printRowCrossChecks(rowData, r) {
    console.log("row "+r+" cross checks:");
    for (var i=0; i<rowData.length; i++) {
        var col = [];
        Object.keys(rowData[i]).map(function(key) {
            col.push(key+":"+rowData[i][key]);
        })
        console.log("  "+i+": ["+col.join(",")+"]");
    }
}

function printMoves(moves) {
    var defaultLimit = 50;
    var limit = moves.length < defaultLimit ? moves.length : defaultLimit;
    for (var i=0; i<limit; i++) {
        var r = moves[i].row > 9 ? ""+moves[i].row : " "+moves[i].row;
        var c = moves[i].col > 9 ? ""+moves[i].col : " "+moves[i].col;
        var d = moves[i].direction === "down" ? "  down" : "across";
        console.log(moves[i].word.toUpperCase()+" ("+moves[i].score+" pts)");
        console.log("    ["+r+","+c+"] "+d+" | "+moves[i].lettersUsedCount+" tiles placed | tiles used: "+moves[i].lettersUsed.split("").join(",")+" | bonus count: "+moves[i].bonusSquareCount+" | bonus score: "+moves[i].bonusSquareScore);
    }
}

function isCompletelyEmpty(board) {
    for (var i=0; i<board.length; i++) {
        for (var j=0; j<board[0].length; j++) {
            if (!isEmpty(board[i][j])) {
                return false;
            }
        }
    }
    return true;
}

function sortByScore(a,b) {
    return b.score-a.score;
}

function sortByBonus(a,b) {
    if (b.bonusSquareCount === a.bonusSquareCount) {
        return b.bonusSquareScore - a.bonusSquareScore;
    }
    return b.bonusSquareCount - a.bonusSquareCount;
}

function run(gameBoard, rack, strategy) {
    legalMoves = [];

    console.time("found moves");

    if (isCompletelyEmpty(gameBoard)) {
        //it's the first move! no other tiles placed on board

        var rowAnchorsList = [[7,7]]; //the middle square is our only anchor
        var limit = 7;

        var rowData = computeCrossChecks(gameBoard, 7); //we only care about the middle row
        leftPart(gameBoard, rowData, "", dict, limit, rowAnchorsList[0], rack, "across", []);

        var transposedBoard = transpose(gameBoard);
        var rowData = computeCrossChecks(transposedBoard, 7); //we only care about the middle row
        leftPart(transposedBoard, rowData, "", dict, limit, rowAnchorsList[0], rack, "down", []);

    } else {

        // printBoard(gameBoard);

        for (var i=0; i<gameBoard.length; i++) {
            var rowAnchorsSet = findAnchorSquares(gameBoard,i);
            if (rowAnchorsSet.isEmpty()) continue;

            var rowAnchorsList = rowAnchorsSet.toList();

            var rowData = computeCrossChecks(gameBoard,i);
            //rowData is an array of this form:
            //  [ [list of chars legal at idx 0], ...}
            // printRowCrossChecks(rowData, i);

            //now, using this info, we can find all the legal horizontal
            //moves in row i

            // we find all moves anchored at each anchor
            for (var a=0; a<rowAnchorsList.length; a++) {
                var row = i;
                var col = rowAnchorsList[a][1];

                //calculate the limit (the number of non-anchors to the left
                //of this anchor cell)
                var limit = 0;
                var t = col-1;
                while (t >= 0 && !rowAnchorsSet.contains([row,t])) {
                    limit++;
                    t--;
                }

                leftPart(gameBoard, rowData, "", dict, limit, rowAnchorsList[a], rack, "across", []);
            }
        }

        var transposedBoard = transpose(gameBoard);

        // printBoard(transposedBoard);

        for (var i=0; i<transposedBoard.length; i++) {
            var rowAnchorsSet = findAnchorSquares(transposedBoard,i);
            if (rowAnchorsSet.isEmpty()) continue;

            var rowAnchorsList = rowAnchorsSet.toList();

            var rowData = computeCrossChecks(transposedBoard,i);
            //rowData is an array of this form:
            //  [ [list of chars legal at idx 0], ...}
            // printRowCrossChecks(rowData, i);

            //now, using this info, we can find all the legal horizontal
            //moves in row i

            // we find all moves anchored at each anchor
            for (var a=0; a<rowAnchorsList.length; a++) {
                var row = i;
                var col = rowAnchorsList[a][1];

                //calculate the limit (the number of non-anchors to the left
                //of this anchor cell)
                var limit = 0;
                var t = col-1;
                while (t >= 0 && !rowAnchorsSet.contains([row,t])) {
                    limit++;
                    t--;
                }

                leftPart(transposedBoard, rowData, "", dict, limit, rowAnchorsList[a], rack, "down", "");
            }
        }
    }

    var sortingFunction;
    switch (strategy) {
        case "points": sortingFunction = sortByScore; break;
        case "bonus": sortingFunction = sortByBonus; break;
        default: sortingFunction = sortByScore;
    }

    legalMoves = legalMoves.sort(sortingFunction);

    printMoves(legalMoves);
    console.log(legalMoves.length+" total moves found with rack: "+rack.split("").join(" "));
    console.timeEnd("found moves");

    return legalMoves;
}

var board = fs.readFileSync('input.board', 'utf8').split('\n').map(function(line) {
    return line.split("").map(function(chr) {
        return chr === "." ? "" : chr.toLowerCase();
    });
});

var rack = "lcdridc";

run(board,rack);

module.exports.print = printBoard;
module.exports.solve = run;
