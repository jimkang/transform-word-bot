var _ = require('lodash');
var createIsCool = require('iscool');
var iscool = createIsCool();

function getWorthwhileWordsFromText(text) {
  var words = text.split(/[ ":.,;!?#]/);
  var filteredWords = [];
  words = _.uniq(_.compact(words));
  if (words.length > 0) {
    filteredWords = words.filter(wordDoesNotStartWithAtSymbol);
  }
  return filteredWords.filter(iscool);
}

function wordDoesNotStartWithAtSymbol(word) {
  return word.indexOf('@') === -1;
}

module.exports = getWorthwhileWordsFromText;
