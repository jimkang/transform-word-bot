var _ = require('lodash');
var createIsCool = require('iscool');
var iscool = createIsCool();

function getWorthwhileWordsFromText(text, doNotPick) {
  var words = text.split(/[ ":.,;!?#]/);
  var filteredWords = [];
  words = _.uniq(_.compact(words));
  if (words.length > 0) {
    filteredWords = words.filter(wordDoesNotStartWithAtSymbol);
    if (doNotPick) {
      filteredWords = filteredWords.filter(wordIsNotInDoNotPick);
    }
  }
  return filteredWords.filter(iscool);

  function wordIsNotInDoNotPick(word) {
    return doNotPick.indexOf(word.toLowerCase()) === -1;
  }
}

function wordDoesNotStartWithAtSymbol(word) {
  return word.indexOf('@') === -1;
}

module.exports = getWorthwhileWordsFromText;
