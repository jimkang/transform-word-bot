var probable = require('probable');

function formatMessage(transformee, transformed) {
  return probable.pickFromArray([
    `OK! I'm improving "${transformee}" for you! Now you have: ${transformed}!`,
    `We can make a better ${transformee}. We can have: ${transformed}!`,    
    `I'm going to rebuild ${transformee} into something much better: ${transformed}!`,
    `CLANG CLANG CLANG! I am reforging "${transformee}" into: ${transformed}!`,
    `Whirrr click! Whirrr click! "${transformee}" has been reassembled into: ${transformed}!`
  ]);
}

module.exports = formatMessage;
