var callNextTick = require('call-next-tick');
var getWorthwhileWordsFromText = require('./get-worthwhile-words-from-text');

function getRarestWordFromText(opts, done) {
  var wordnok;
  var text;
  var doNotPick;

  if (opts) {
    wordnok = opts.wordnok;
    text = opts.text;
    doNotPick = opts.doNotPick;
  }

  var words = getWorthwhileWordsFromText(text, doNotPick);

  if (words.length < 1) {
    wordnok.getTopic(done);
    return;
  }

  if (words.length === 1) {
    callNextTick(done, null, words[0]);
    return;
  }

  wordnok.getWordFrequencies(words, getRarest);

  function getRarest(error, frequencies) {
    var rarestFrequency = 1000000;
    var rarestWord;

    if (error) {
      done(error);
    } else {
      frequencies.forEach(saveRarest);
      done(null, rarestWord);
    }

    function saveRarest(freq, i) {
      if (freq === 0) {
        freq = 99999;
      }

      if (freq < rarestFrequency) {
        rarestFrequency = freq;
        rarestWord = words[i];
      }
    }
  }
}

module.exports = getRarestWordFromText;
