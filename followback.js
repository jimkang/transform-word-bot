var filteredFollowback = require('filtered-followback');
var config = require('./config/config.js');

filteredFollowback(
  {
    twitterCreds: config.twitter,
    neverUnfollow: [
      3247937115,
      3158440414,
      3257074863,
      2882218444,
      3755520987
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
