/* global process */

var filteredFollowback = require('filtered-followback');

var configName;

if (process.argv.length > 2) {
  configName = process.argv[2];
}

var config = require('./config/' + configName + '-config');

filteredFollowback(
  {
    twitterCreds: config.twitter,
    neverUnfollow: [
      '724041937901228000', // magicapplier
      '3236234039', // atyrannyofwords
    ]
  },
  reportResults
);

function reportResults(error, followed, unfollowed) {
  if (error) {
    console.log(error);
  }
  console.log('Followed:', followed);
  console.log('Unfollowed:', unfollowed);
}
