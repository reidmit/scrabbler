exports.trieSearch = (root, word) => {
  let node = root;

  for (let i = 0; i < word.length; i++) {
    const c = word.charAt(i);
    if (!node[c]) return false;
    node = node[c];
  }

  return node.$ === 1;
};

exports.transposeBoard = board => {
  const newBoard = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      newBoard[j][i] = board[i][j];
    }
  }

  return newBoard;
};

exports.isEmpty = cell => {
  return cell.length === 0;
};

exports.isCompletelyEmpty = board => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (board[i][j].length !== 0) {
        return false;
      }
    }
  }
  return true;
};
