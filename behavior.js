var behavior = {
  secondsToWaitBetweenRepliesToSameUser: 10,
  counterExpirationSeconds: 5 * 60,
  maxRepliesInCounterLifetime: 10,
  maxLimitedRepliesInCounterLifetime: 2,
  limitedRepliesScreenNames: [
    'magicapplier',
    'improvebot',
    'cleromancer',
    'godtributes',
    'cryptbooks'
  ],
  chanceOfReplyingToLimitedReplyUser: 5,
  secondsToWaitBetweenChimeIns: 12 * 60 * 60,
  maxNumberOfTimesToTalkAboutTopicPerUser: 3,
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
