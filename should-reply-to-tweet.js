var callNextTick = require('call-next-tick');
var betterKnowATweet = require('better-know-a-tweet');
var async = require('async');
var behavior = require('./behavior');

// Passes an error if you should not reply.
function shouldReplyToTweet(opts, done) {
  var tweet;
  var chronicler;
  var waitingPeriod;
  var config;
  var recentReplyCounter;
  var probable;

  if (opts) {
    tweet = opts.tweet;
    chronicler = opts.chronicler;
    config = opts.config;
    recentReplyCounter = opts.recentReplyCounter;
    probable = opts.probable;
  }

  if (tweet.user.screen_name === config.username) {
    callNextTick(done, new Error('Subject tweet is own tweet.'));
    return;
  }

  if (betterKnowATweet.isRetweetOfUser(config.username, tweet)) {
    callNextTick(done, new Error('Subject tweet is own retweet.'));
    return;
  }

  var tweetMentionsBot = doesTweetMentionBot(tweet);

  if (!tweetMentionsBot) {
    // Chiming in.
    waitingPeriod = behavior.secondsToWaitBetweenChimeIns;
  } else if (tweetMentionsBot) {
    var maxRepliesInCounterLifetime = behavior.maxRepliesInCounterLifetime;

    if (
      behavior.limitedRepliesScreenNames.indexOf(tweet.user.screen_name) !== -1
    ) {
      maxRepliesInCounterLifetime = behavior.maxLimitedRepliesInCounterLifetime;

      if (probable.rollDie(100) > behavior.chanceOfReplyingToLimitedReplyUser) {
        maxRepliesInCounterLifetime = 0;
      }
    }

    if (
      recentReplyCounter.getCountForKey(tweet.user.screen_name) >=
      maxRepliesInCounterLifetime
    ) {
      callNextTick(
        done,
        new Error(
          'Already replied enough recently to ' + tweet.user.screen_name
        )
      );
      return;
    } else {
      // Probably replying.
      waitingPeriod = behavior.secondsToWaitBetweenRepliesToSameUser;
    }
  } else {
    callNextTick(done, new Error('Not chiming in or replying.'));
    return;
  }

  async.waterfall([goFindLastReplyDate, replyDateWasNotTooRecent], done);

  function goFindLastReplyDate(done) {
    findLastReplyDateForUser(tweet, done);
  }

  function findLastReplyDateForUser(tweet, done) {
    chronicler.whenWasUserLastRepliedTo(
      tweet.user.id.toString(),
      passLastReplyDate
    );

    function passLastReplyDate(error, date) {
      // Don't pass on the error – `whenWasUserLastRepliedTo` can't find a
      // key, it returns a NotFoundError. For us, that's expected.
      if (error && error.type === 'NotFoundError') {
        error = null;
        date = new Date(0);
      }
      done(error, tweet, date);
    }
  }

  function replyDateWasNotTooRecent(tweet, date, done) {
    if (typeof date !== 'object') {
      date = new Date(date);
    }
    var secondsElapsed = (Date.now() - date.getTime()) / 1000;

    if (secondsElapsed > waitingPeriod) {
      done();
    } else {
      done(
        new Error(
          `Replied ${secondsElapsed} seconds ago to ${tweet.user.screen_name}.
        Need at least ${waitingPeriod} to pass.`
        )
      );
    }
  }

  function doesTweetMentionBot(tweet) {
    var usernames = betterKnowATweet.whosInTheTweet(tweet);
    return usernames && usernames.indexOf(config.username) !== -1;
  }
}

module.exports = shouldReplyToTweet;
