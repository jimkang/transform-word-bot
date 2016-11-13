var test = require('tape');
var getRarestWordFromText = require('../get-rarest-word-from-text');
var createWordnok = require('wordnok').createWordnok;
var config = require('../config/improvebot-config');
var assertNoError = require('assert-no-error');

var wordnok = createWordnok({
  apiKey: config.wordnikAPIKey
});

var opts = {
  wordnok: wordnok,
  text: 'Let us make relinquishment magical! It is now: samsara!',
  doNotPick: [
    'let',
    'us',
    'make',
    'magical',
    'it',
    'is',
    'now'
  ]
};

for (var i = 0; i < 20; ++i) {
  test('Do not pick test', doNotPickTest);
}

function doNotPickTest(t) {
  getRarestWordFromText(opts, checkWord);

  function checkWord(error, word) {
    assertNoError(t.ok, error, 'No error while getting word.');
    console.log('Picked word:', word);
    t.equal(opts.doNotPick.indexOf(word), -1, 'Word is not from doNotPick');
    t.end();
  }
}
