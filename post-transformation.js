/* global process */
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var seedrandom = require('seedrandom');
var createWordnok = require('wordnok').createWordnok;
var createProbable = require('probable').createProbable;
var GetTransformationText = require('./get-transformation-text');

var dryRun = false;
var configName;
var numberOfTries = 0;
var maxTries = 5;

if (process.argv.length > 3) {
  dryRun = process.argv[3].toLowerCase() == '--dry';
}

if (process.argv.length > 2) {
  configName = process.argv[2];
}

var config = require('./config/' + configName + '-config');

var seed = new Date().toISOString();
console.log('seed:', seed);

var random = seedrandom(seed);

var probable = createProbable({
  random: random
});

var wordnok = createWordnok({
  apiKey: config.wordnikAPIKey
});

var getTransformationText = GetTransformationText({
  configName: configName,
  gnewsWord2VecURL: config.gnewsWord2VecURL,
  probable: probable,
  wordnok: wordnok
});

var twit = new Twit(config.twitter);

function tryToPostTransformation() {
  async.waterfall(
    [getTopics, pickFirst, getTransformationText, postTweet],
    wrapUp
  );
}

function getTopics(done) {
  var opts = {
    customParams: {
      minCorpusCount: 1000,
      limit: 1
    }
  };
  wordnok.getRandomWords(opts, done);
}

function pickFirst(words, done) {
  if (words.length < 1) {
    callNextTick(done, new Error('No topics found.'));
  } else {
    callNextTick(done, null, words[0]);
  }
}

function postTweet(text, done) {
  if (dryRun) {
    console.log('Would have tweeted:', text);
    var mockTweetData = {
      user: {
        id_str: 'mockuser'
      }
    };
    callNextTick(done, null, mockTweetData);
  } else {
    var body = {
      status: text
    };
    twit.post('statuses/update', body, done);
  }
}

function wrapUp(error, data) {
  numberOfTries += 1;

  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }

    if (numberOfTries < maxTries) {
      console.log('Tried', numberOfTries, 'so far. retrying.');
      callNextTick(tryToPostTransformation);
    }
  } else {
    console.log('post-transformation complete.');
  }
}

tryToPostTransformation();
