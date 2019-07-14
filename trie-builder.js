var fs = require('fs');

//32176105 bytes (32.2 mb - lol)
// some naive things: every child initialized to {}, children prop, $ prop (bool), _ prop

// fixes: children only init when needed, children renamed to _
//   way faster!
//3307411 bytes (3.3 mb - a whole order of magnitude better)

//fixes: got rid of _ prop, children now direct props of node
//2343600 bytes (2.3 mb - a huge reduction!)

//fixes: $ was bool, is now 0/1
//1817203 bytes (1.8 mb - woohooooo)
var config = {
  writeToFile: true,
  build: false
};

function normalize(word) {
  return word
    .toLowerCase()
    .split('')
    .filter(function(letter) {
      return /[a-z]/.test(letter);
    })
    .join('');
}

var TrieNode = function() {
  var self = this;
  this.$ = 0;

  this.toString = function() {
    var arr = [];
    if (self.$ === 1) {
      arr.push('1');
    } else {
      arr.push('0');
    }

    Object.keys(self)
      .sort()
      .forEach(function(c) {
        if (c !== '$' && typeof self[c] !== 'function') {
          arr.push(c);
          arr.push(self[c].toString());
        }
      });

    return arr.join('_');
  };

  // this.freeze = function() {
  //     var suffixTree = {};

  //     var node = self;
  //     var stack = [];
  //     var depthStack = [node];

  //     while (depthStack.length) {
  //         console.log("depthStack length is "+depthStack.length);
  //         node = depthStack.pop();

  //         Object.keys(node).forEach(function(c) {
  //             if (c !== "$" && typeof node[c] !== "function") {
  //                 var current = node[c];
  //                 stack.push({
  //                     current: current,
  //                     char: c,
  //                     parent: node
  //                 });
  //                 depthStack.push(current);
  //             }
  //         })
  //     }

  //     console.log("MIDDLE");

  //     while (stack.length) {
  //         console.log("stack length is "+stack.length);
  //         var popped = stack.pop();
  //         var char = popped.char;
  //         var parent = popped.parent;
  //         var current = popped.current;

  //         if (suffixTree.hasOwnProperty(char)) {
  //             var suffixMeta = suffixTree[char];

  //             var match;
  //             var f = function(other) {
  //                 var oKeys = Object.keys(other);
  //                 var cKeys = Object.keys(current);
  //                 return (
  //                     oKeys.length === cKeys.length &&
  //                     oKeys.every(function(key) { return other[key] === current[key] })
  //                 );
  //             };
  //             for (var i=0; i<suffixMeta.length; i++) {
  //                 var other = suffixMeta[i];
  //                 if (f(other)) {
  //                     match = other;
  //                     break;
  //                 }
  //             }

  //             if (match) {
  //                 parent[char] = match;
  //             } else {
  //                 suffixMeta.push(current);
  //             }
  //         } else {
  //             suffixTree[char] = [current];
  //         }
  //     }

  //     return this;
  // }

  this.insert = function(word) {
    var node = self;
    var i = 0;
    var n = word.length;

    while (i < n) {
      var c = word.charAt(i);
      if (node[c]) {
        node = node[c];
        i++;
      } else {
        break;
      }
    }

    while (i < n) {
      var c = word.charAt(i);
      node[c] = new TrieNode();
      node = node[c];
      i++;
    }

    node.$ = 1;
  };

  this.search = function(word) {
    var node = self;
    for (var i = 0; i < word.length; i++) {
      var c = word.charAt(i);
      if (!node[c]) {
        return false;
      } else {
        node = node[c];
      }
    }
    return node.$ === 1;
  };
};

if (config.build) {
  var words = fs.readFileSync('sowpods.txt', 'utf8').split('\n');
  var trie = new TrieNode();
  words.forEach(function(word) {
    trie.insert(normalize(word));
  });
  console.log('Trie built!');

  var jsonTrie = JSON.stringify(trie);
  var jsTrie = 'module.exports=' + jsonTrie.replace(/\"/g, '');

  if (config.writeToFile) {
    fs.writeFile('dict.json', jsonTrie, function(err) {
      if (err) return console.log(err);
      console.log('JSON file written successfully.');
    });
    fs.writeFile('dict.js', jsTrie, function(err) {
      if (err) return console.log(err);
      console.log('JS file written successfully.');
    });
  }
}

module.exports.Node = TrieNode;
module.exports.search = trieSearch;
