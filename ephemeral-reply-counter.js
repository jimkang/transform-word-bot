function EphemeralReplyCounter({expirationTimeInSeconds}) {
  var currentCounter;

  resetCounter();
  var intervalKey = setInterval(resetCounter, expirationTimeInSeconds * 1000);

  return {
    incrementForKey: incrementForKey,
    getCountForKey: getCountForKey,
    kill: kill
  };

  function kill() {
    clearInterval(intervalKey);
  }

  function incrementForKey(key) {
    currentCounter.incrementForKey(key);
  }

  function getCountForKey(key) {
    return currentCounter.getCountForKey(key);
  }

  function resetCounter() {
    currentCounter = ActualReplyCounter();
  }
}

function ActualReplyCounter() {
  var countsForKeys = {};

  function incrementForKey(key) {
    var count;
    if (key in countsForKeys) {
      count = countsForKeys[key];
    }
    else {
      count = 0;
    }

    count += 1;
    countsForKeys[key] = count;
  }

  function getCountForKey(key) {
    // console.log(JSON.stringify(countsForKeys, null, '  '));
    return key in countsForKeys ? countsForKeys[key] : 0;
  }

  return {
    incrementForKey: incrementForKey,
    getCountForKey: getCountForKey
  };
}

module.exports = EphemeralReplyCounter;
