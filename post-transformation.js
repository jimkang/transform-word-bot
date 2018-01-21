/* global process */
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var seedrandom = require('seedrandom');
var createWordnok = require('wordnok').createWordnok;
var createProbable = require('probable').createProbable;
var GetTransformationText = require('./get-transformation-text');
var StaticWebArchiveOnGit = require('static-web-archive-on-git');
var queue = require('d3-queue').queue;
var randomId = require('idmaker').randomId;

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

var staticWebStream = StaticWebArchiveOnGit({
  config: config.github,
  title: config.archiveName,
  footerScript: `<script type="text/javascript">
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-49491163-1', 'jimkang.com');
  ga('send', 'pageview');
</script>`,
  maxEntriesPerPage: 50
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
    [getTopics, pickFirst, getTransformationText, postToTargets],
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

function postToTargets(text, done) {
  if (dryRun) {
    console.log('Would have tweeted:', text);
    var mockTweetData = {
      user: {
        id_str: 'mockuser'
      }
    };
    callNextTick(done, null, mockTweetData);
  } else {
    var q = queue();
    q.defer(postTweet, text);
    q.defer(postToArchive, text);
    q.await(done);
  }
}

function postToArchive(text, done) {
  var id = 'improvement-' + randomId(8);
  staticWebStream.write({
    id,
    date: new Date().toISOString(),
    caption: text
  });
  staticWebStream.end(done);
}

function postTweet(text, done) {
  var body = {
    status: text
  };
  twit.post('statuses/update', body, done);
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
