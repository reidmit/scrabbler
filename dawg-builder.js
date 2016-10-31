var fs = require('fs');
var microtime = require('microtime');

var config = {
    writeToFile: true,
    build: true
}

function isLetter(c) {
    return /[a-zA-Z]/.test(c);
}
function normalize(word) {
    return word.toLowerCase().split("").filter(isLetter).join("");
}
function stringHash(str) {
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

var DawgNode = function() {
    var self = this;
    self.$ = 0;
    // self._ = {};

    this.toString = function() {
        var arr = [];
        if (self.$ === 1) {
            arr.push("1");
        } else {
            arr.push("0");
        }

        Object.keys(self).sort().forEach(function(c) {
            if (c !== "$" && typeof self[c] !== "function") {
                arr.push(c);
                arr.push(self[c].toString());
            }
        });

        return arr.join("_");
    }

    this.toHash = function() {
        return stringHash(self.toString());
    }

    this.equals = function(other) {
        return self.toString().localeCompare(other.toString()) === 0;
    }
}

var Dawg = function() {
    var self = this;

    self.previousWord = "";
    self.root = new DawgNode()

    self.uncheckedNodes = [];
    self.minimizedNodes = {};

    self.insert = function(word) {
        if (word < self.previousWord) {
            throw Error("Words must be inserted in alphabetical order. Sort the list first, if necessary.");
        }

        var commonPrefix = 0;
        for (var i=0; i < Math.min(word.length, self.previousWord.length); i++) {
            if (word.charAt(i) !== self.previousWord.charAt(i)) {
                break;
            }
            commonPrefix++;
        }

        self._minimize(commonPrefix);

        var node;
        if (self.uncheckedNodes.length === 0) {
            node = self.root;
        } else {
            node = self.uncheckedNodes[self.uncheckedNodes.length-1][2];
        }

        var nextNode;
        for (var i=commonPrefix; i<word.length; i++) {
            var letter = word.charAt(i);
            nextNode = new DawgNode();
            node[letter] = nextNode;
            self.uncheckedNodes.push([node, letter, nextNode]);
            node = nextNode;
        }

        node.$ = 1;
        self.previousWord = word;
    }

    self.finish = function() {
        self._minimize(0);
    }

    self._minimize = function(downTo) {
        for (var i=self.uncheckedNodes.length-1; i >= downTo; i--) {
            var parent = self.uncheckedNodes[i][0];
            var letter = self.uncheckedNodes[i][1];
            var child  = self.uncheckedNodes[i][2];
            var childInMinimizedNodes = false;
            for (var hashKey in self.minimizedNodes) {
                if (self.minimizedNodes.hasOwnProperty(hashKey)) {
                    if (child.equals(self.minimizedNodes[hashKey])) {
                        childInMinimizedNodes = true;
                        break;
                    }
                }
            }
            if (childInMinimizedNodes) {
                parent[letter] = self.minimizedNodes[child.toString()];
            } else {
                self.minimizedNodes[child.toString()] = child;
            }
            self.uncheckedNodes.pop();
        }
    }

    self.lookup = function(word) {
        var node = self.root;
        for (var i=0; i<word.length; i++) {
            var c = word.charAt(i);
            if (node[c] === undefined) {
                return false;
            }
            node = node[c];
        }
        return node.$ === 1;
    }

    self.nodeCount = function() {
        return Object.keys(self.minimizedNodes).length;
    }

    self.edgeCount = function() {
        var count = 0;
        for (var hashKey in self.minimizedNodes) {
            if (self.minimizedNodes.hasOwnProperty(hashKey)) {
                var minNode = self.minimizedNodes[hashKey];
                count += (Object.keys(minNode).length - 4);
            }
        }
        return count;
    }
}

var MiniDawg = function(dawg) {
    var self = this;

    self.root = dawg.root;

    self.lookup = function(word) {
        var node = self.root;
        for (var i=0; i<word.length; i++) {
            var c = word.charAt(i);
            if (node[c] === undefined) {
                return false;
            }
            node = node[c];
        }
        return node.$ === 1;
    }
}

if (config.build) {
    console.time("read file");
    var words = fs.readFileSync('ospd.txt', 'utf8').split('\n');
    console.timeEnd("read file");


/*
    console.time("build dawg");
    var dawg = new Dawg();
    words.forEach(function(word) {
        dawg.insert(word);
        console.log("done inserting "+word);
    });
    console.log("Dawg built!");
    console.timeEnd("build dawg");

    console.time("search dawg");
    console.log(
        dawg.lookup("apple"),
        dawg.lookup("quetzal"),
        dawg.lookup("pretzel"),
        dawg.lookup("reid")
    )
    console.timeEnd("search dawg");

    console.log("before, edge count = "+dawg.edgeCount());
    console.log("before, node count = "+dawg.nodeCount());

    console.log("gonna minimize...");
    console.time("finishing");
    dawg.finish();

    console.timeEnd("finishing");
    console.log("after, edge count = "+dawg.edgeCount());
    console.log("after, node count = "+dawg.nodeCount());
    // console.time("build mini");
    // var mini = new MiniDawg(dawg);
    // console.log("MiniDawg built!");
    // console.timeEnd("build mini");

    // console.time("search mini");
    // console.log(
    //     mini.lookup("apple"),
    //     mini.lookup("quetzal"),
    //     mini.lookup("pretzel"),
    //     mini.lookup("reid")
    // )
    // console.timeEnd("search mini");
    //10248294 bytes -> JSON of full dawg, with "edges" field
    //2781023 bytes -> JSON of minidawg, with "_" instead of "edges"
    //1817212 bytes -> JSON of minidawg, with no edge prop
    //all of the above was with minimization not actually working...
*/
    if (config.writeToFile) {
        // fs.writeFile("dict-dawg.json", JSON.stringify(new MiniDawg(dawg)), function(err) {
        fs.writeFile("dict-dawg.json", JSON.stringify(dawg), function(err) {
           if (err) return console.log(err);
           console.log("File written successfully.");
        });
    }
}