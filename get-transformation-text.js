var callNextTick = require('call-next-tick');
var async = require('async');
var GetWord2VecNeighbors = require('get-w2v-google-news-neighbors');
var nounfinder = require('nounfinder');
var createIsCool = require('iscool');
var iscool = createIsCool();

function createIndexPickTableDef(arraySize) {
  var def = [];

  for (var i = 0; i < arraySize; ++i) {
    def.push([arraySize - i, i]);
  }

  return def;
}

function GetTransformationText({
  probable,
  gnewsWord2VecURL,
  configName,
  wordnok
}) {
  var addWordTableDef = require('./' + configName + '/add-word-table-def');
  var formatMessage = require('./' + configName + '/format-message');
  var addWordTable = probable.createTableFromSizes(addWordTableDef);

  var getWord2VecNeighbors = GetWord2VecNeighbors({
    gnewsWord2VecURL: gnewsWord2VecURL,
    nounfinder: nounfinder,
    probable: probable,
    wordnok: wordnok,
    nounLikePhrasesOnly: false,
    nounWordsOnly: false,
    doNotSample: true
  });

  return getTransformationText;

  function getTransformationText(transformee, done) {
    async.waterfall([getNeighbors, pickNeighbors, composeMessage], done);

    function getNeighbors(done) {
      var words = [addWordTable.roll(), transformee];
      // console.log('words', words);
      getWord2VecNeighbors(words, done);
    }

    function pickNeighbors(neighbors, done) {
      if (!neighbors || neighbors.length < 1) {
        callNextTick(done, new Error('No neighbors found.'));
      } else {
        neighbors = neighbors.filter(doesNotContainTransformee);
        neighbors = neighbors.filter(iscool);

        var tableDef = createIndexPickTableDef(neighbors.length);
        var pickedIndex = probable.createTableFromSizes(tableDef).roll();
        var picked = neighbors[pickedIndex];
        callNextTick(done, null, picked);
      }
    }

    function doesNotContainTransformee(word) {
      return (
        word.indexOf(transformee) === -1 && word.indexOf(word + 's') === -1
      );
    }

    function composeMessage(transformed, done) {
      callNextTick(done, null, formatMessage(transformee, transformed));
    }
  }
}

module.exports = GetTransformationText;
