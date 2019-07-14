const { letterValues } = require('./constants');
const colors = require('colors/safe');

function printBoard(b) {
  var aux = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E'].map(
    c => colors.bold.yellow(c)
  );

  var topRow = colors.yellow('╔═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╗');
  var sepRow = colors.yellow('╟───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───╢');
  var botRow = colors.yellow('╚═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╝');

  var tileInfo = [
    colors.bold('letter values'),
    'A: ' + letterValues.a + '   ' + 'N: ' + letterValues.n,
    'B: ' + letterValues.b + '   ' + 'O: ' + letterValues.o,
    'C: ' + letterValues.c + '   ' + 'P: ' + letterValues.p,
    'D: ' + letterValues.d + '   ' + 'Q: ' + letterValues.q,
    'E: ' + letterValues.e + '   ' + 'R: ' + letterValues.r,
    'F: ' + letterValues.f + '   ' + 'S: ' + letterValues.s,
    'G: ' + letterValues.g + '   ' + 'T: ' + letterValues.t,
    'H: ' + letterValues.h + '   ' + 'U: ' + letterValues.u,
    'I: ' + letterValues.i + '   ' + 'V: ' + letterValues.v,
    'J: ' + letterValues.j + '   ' + 'W: ' + letterValues.w,
    'K: ' + letterValues.k + '   ' + 'X: ' + letterValues.x,
    'L: ' + letterValues.l + '   ' + 'Y: ' + letterValues.y,
    'M: ' + letterValues.m + '   ' + 'Z: ' + letterValues.z
  ];

  console.log(topRow);
  console.log(colors.yellow('║ ') + aux.join(colors.yellow(' │ ')) + colors.yellow(' ║'));
  console.log(sepRow);

  var c = 0;
  for (var i = 0; i < b.length; i++) {
    var j = -1;

    var row = b[i].map(c => {
      j++;
      if (c.length === 0) {
        if (mult.letter[i][j] === 2) return colors.blue(' ⁚ ');
        if (mult.letter[i][j] === 3) return colors.blue(' ⁖ ');
        if (mult.word[i][j] === 2) return colors.red(' ⁚ ');
        if (mult.word[i][j] === 3) return colors.red(' ⁖ ');
        return '   ';
      }
      return ' ' + c.toUpperCase() + ' ';
    });

    var label = aux[i + 1];
    if (c < tileInfo.length)
      console.log(
        colors.yellow('║ ') +
          label +
          colors.yellow(' │') +
          row.join(colors.yellow('│')) +
          colors.yellow('║') +
          '  ' +
          tileInfo[c++]
      );
    else
      console.log(
        colors.yellow('║ ') +
          label +
          colors.yellow(' │') +
          row.join(colors.yellow('│')) +
          colors.yellow('║')
      );

    if (i !== b.length - 1) {
      if (c < tileInfo.length) console.log(sepRow + '  ' + tileInfo[c++]);
      else console.log(sepRow);
    }
  }

  console.log(botRow);
}

module.exports = printBoard;
