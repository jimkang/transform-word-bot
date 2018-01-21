#!/usr/bin/env node

/* global process __dirname */

var configName = 'magic-applier';
var hasLowerCaseRegex = /[a-z]/;

var dryRun = false;
if (process.argv.length > 3) {
  dryRun = process.argv[3].toLowerCase() == '--dry';
}

if (process.argv.length > 2) {
  configName = process.argv[2];
}

var config = require('./config/' + configName + '-config');

var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var createChronicler = require('basicset-chronicler');
var seedrandom = require('seedrandom');
var createProbable = require('probable').createProbable;
var createWordnok = require('wordnok').createWordnok;
var shouldReplyToTweet = require('./should-reply-to-tweet');
var getRarestWordFromText = require('./get-rarest-word-from-text');
var GetTransformationText = require('./get-transformation-text');
var EphemeralReplyCounter = require('./ephemeral-reply-counter');
var behavior = require('./behavior');

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

var chronicler = createChronicler({
  dbLocation: __dirname + '/data/' + configName + '-chronicler.db'
});

var recentReplyCounter = EphemeralReplyCounter({
  expirationTimeInSeconds: behavior.counterExpirationSeconds
});

var twit = new Twit(config.twitter);
var streamOpts = {
  replies: 'all'
};
var stream = twit.stream('user', streamOpts);

stream.on('tweet', respondToTweet);

function respondToTweet(tweet) {
  var topic;

  async.waterfall(
    [
      checkIfWeShouldReply,
      getTransformee,
      saveTopic,
      checkNumberOfTimesTopicHasBeenDiscussedForUser,
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
      recentReplyCounter: recentReplyCounter,
      config: config,
      probable: probable
    };
    // console.log('Checking tweet from', tweet.user.screen_name);
    shouldReplyToTweet(opts, done);
  }

  function getTransformee(done) {
    var doNotPick =
      behavior.doNotUseWordsForScreenNames[tweet.user.screen_name];

    getRarestWordFromText(
      {
        wordnok: wordnok,
        text: tweet.text,
        doNotPick: doNotPick
      },
      done
    );
  }

  function saveTopic(transformee, done) {
    topic = transformee;
    if (topic.match(hasLowerCaseRegex) === null) {
      topic = topic.toLowerCase();
    }
    callNextTick(done, null, topic);
  }

  function checkNumberOfTimesTopicHasBeenDiscussedForUser(topic, done) {
    chronicler.timesTopicWasUsedInReplyToUser(
      topic,
      tweet.user.id_str,
      checkCount
    );

    function checkCount(error, count) {
      if (error) {
        done(error);
      } else {
        if (count >= behavior.maxNumberOfTimesToTalkAboutTopicPerUser) {
          var errorMessage =
            'Already discussed ' +
            topic +
            ' with ' +
            tweet.user.screen_name +
            ' ' +
            count +
            'times.';
          done(new Error(errorMessage));
        } else {
          done(null, topic);
        }
      }
    }
  }

  function postTweet(text, done) {
    text = '@' + tweet.user.screen_name + ' ' + text;

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
        status: text,
        in_reply_to_status_id: tweet.id_str
      };
      twit.post('statuses/update', body, done);
    }
  }

  // TODO: All of these async tasks should have just (opts, done) params.
  function recordThatReplyHappened(closingTweetData, response, done) {
    recentReplyCounter.incrementForKey(tweet.user.screen_name);
    // TODO: recordThatUserWasRepliedTo should be async.
    chronicler.recordThatUserWasRepliedTo(tweet.user.id_str);
    chronicler.recordThatTopicWasUsedInReplyToUser(
      topic,
      tweet.user.id_str,
      done
    );
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
