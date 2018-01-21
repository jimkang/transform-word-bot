var test = require('tape');
var EphemeralReplyCounter = require('../ephemeral-reply-counter');

test('EphemeralReplyCounter test', theTest);

function theTest(t) {
  var counter = EphemeralReplyCounter({ expirationTimeInSeconds: 2 });

  counter.incrementForKey('a');
  counter.incrementForKey('b');

  t.equal(counter.getCountForKey('a'), 1, 'Count for a is correct.');
  t.equal(counter.getCountForKey('b'), 1, 'Count for b is correct.');

  counter.incrementForKey('b');

  t.equal(
    counter.getCountForKey('b'),
    2,
    'Count for b is correct, post-increment.'
  );

  for (var i = 0; i < 3; ++i) {
    counter.incrementForKey('c');
  }

  t.equal(
    counter.getCountForKey('c'),
    3,
    'Count for c is correct, post-increment.'
  );

  setTimeout(checkAfterFirstExpiration, 2000);

  function checkAfterFirstExpiration() {
    t.equal(
      counter.getCountForKey('a'),
      0,
      'Count for a is correct, post-expiration.'
    );
    t.equal(
      counter.getCountForKey('b'),
      0,
      'Count for b is correct, post-expiration.'
    );
    t.equal(
      counter.getCountForKey('c'),
      0,
      'Count for c is correct, post-expiration.'
    );

    counter.incrementForKey('a');
    t.equal(counter.getCountForKey('a'), 1, 'Count for a is correct.');
    counter.incrementForKey('a');
    t.equal(counter.getCountForKey('a'), 2, 'Count for a is correct.');
    counter.incrementForKey('a');
    t.equal(counter.getCountForKey('a'), 3, 'Count for a is correct.');
    counter.incrementForKey('a');
    t.equal(counter.getCountForKey('a'), 4, 'Count for a is correct.');

    for (var i = 0; i < 3; ++i) {
      counter.incrementForKey('b');
    }
    t.equal(counter.getCountForKey('b'), 3, 'Count for b is correct.');

    counter.incrementForKey('d');
    t.equal(counter.getCountForKey('d'), 1, 'Count for d is correct.');

    setTimeout(checkAfterSecondExpiration, 2000);
  }

  function checkAfterSecondExpiration() {
    t.equal(
      counter.getCountForKey('a'),
      0,
      'Count for a is correct, post-expiration.'
    );
    t.equal(
      counter.getCountForKey('b'),
      0,
      'Count for b is correct, post-expiration.'
    );
    t.equal(
      counter.getCountForKey('c'),
      0,
      'Count for c is correct, post-expiration.'
    );
    t.equal(
      counter.getCountForKey('d'),
      0,
      'Count for d is correct, post-expiration.'
    );

    for (let i = 0; i < 13; ++i) {
      counter.incrementForKey('x');
    }
    for (let i = 0; i < 30; ++i) {
      counter.incrementForKey('y');
    }
    for (let i = 0; i < 3; ++i) {
      counter.incrementForKey('b');
    }

    t.equal(counter.getCountForKey('b'), 3, 'Count for b is correct.');
    t.equal(counter.getCountForKey('x'), 13, 'Count for x is correct.');
    t.equal(counter.getCountForKey('y'), 30, 'Count for y is correct.');

    counter.kill();

    t.end();
  }
}
