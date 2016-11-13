var behavior = {
  secondsToWaitBetweenRepliesToSameUser: 20,
  counterExpirationSeconds: 5 * 60,
  maxRepliesInCounterLifetime: 2,
  secondsToWaitBetweenChimeIns: 12 * 60 * 60,
  doNotUseWordsForScreenNames: {
    magicapplier: [
      'let',
      'us',
      'make',
      'magical',
      'it',
      'is',
      'now',
      'huh',
      'eh',
      'ba',
      'boom'
    ],
    improvebot: [
      'OK',
      'i\'m',
      'improving',
      'for',
      'you',
      'now',
      'have',
      'we',
      'can',
      'make',
      'a',
      'better',
      'going',
      'to',
      'rebuild',
      'into',
      'something',
      'much',
      'clang',
      'i',
      'am',
      'reforging'
    ]
  },
};

module.exports = behavior;
