var probable = require('probable');
var range = require('d3-array').range;

var magicDings = ['✨', '🌟', '️⚡', '✨', '🌟', '⚡', '💥', '🔥', '🌈', '🌠', '💀', '💫'];

// var arrows = ['⇒', '⟹', '➾', '⥤', '➮', '➯', '➱', '➩', '⇶', '⇉'];

function formatMessage(transformee, transformed) {
  var dings = '';
  if (probable.roll(3) === 0) {
    dings = range(3 + probable.roll(7)).map(randomDing).join('') + ' ';
  }

  var message = probable.pickFromArray([
    `Let us make "${transformee}" magical! ${dings}It is now: ${transformed}!`,
    `Huh, "${transformee}", eh? BA-BOOM! ${dings}Now it is: ${transformed}!`,
  ]);

  return message;
}

function randomDing() {
  return probable.pickFromArray(magicDings);
}

// function randomArrow() {
//   return probable.pickFromArray(arrows);
// }

module.exports = formatMessage;
