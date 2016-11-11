#!/usr/bin/env node

/* global process __dirname */

var configName = 'magic-applier';

var dryRun = false;
if (process.argv.length > 3) {
  dryRun = (process.argv[3].toLowerCase() == '--dry');
}

if (process.argv.length > 2) {
  configName = process.argv[2];
}

var config = require('./config/' + configName + '-config');

var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var createChronicler = require('basicset-chronicler').createChronicler;
var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var createWordnok = require('wordnok').createWordnok;
var shouldReplyToTweet = require('./should-reply-to-tweet');
var getRarestWordFromText = require('./get-rarest-word-from-text');
var GetTransformationText = require('./get-transformation-text');

var seed = (new Date()).toISOString();
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

var chronicler = createChronicler({
  dbLocation: __dirname + '/data/' + configName + '-chronicler.db'
});

var twit = new Twit(config.twitter);
var streamOpts = {
  replies: 'all'
};
var stream = twit.stream('user', streamOpts);

stream.on('tweet', respondToTweet);

function respondToTweet(tweet) {
  async.waterfall(
    [
      checkIfWeShouldReply,
      getTransformee,
      getTransformationText,
      postTweet,
      recordThatReplyHappened
    ],
    wrapUp
  );

  function checkIfWeShouldReply(done) {
    var opts = {
      tweet: tweet,
      chronicler: chronicler,
      config: config
    };
    // console.log('Checking tweet from', tweet.user.screen_name);
    shouldReplyToTweet(opts, done);
  }

  function getTransformee(done) {
    getRarestWordFromText({wordnok: wordnok, text: tweet.text}, done);
  }

  function postTweet(text, done) {
    text = '@' + tweet.user.screen_name + ' ' + text;

    if (dryRun) {
      console.log('Would have tweeted:', text);
      var mockTweetData = {
        user: {
          id_str: 'mockuser',        
        }
      };
      callNextTick(done, null, mockTweetData);
    }
    else {
      var body = {
        status: text,
        in_reply_to_status_id: tweet.id_str
      };
      twit.post('statuses/update', body, done);
    }
  }

  // TODO: All of these async tasks should have just (opts, done) params.
  function recordThatReplyHappened(closingTweetData, response, done) {
    // TODO: recordThatUserWasRepliedTo should be async.
    chronicler.recordThatUserWasRepliedTo(tweet.user.id_str);
    callNextTick(done);
  }
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
}
