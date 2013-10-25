
suite('set', function() {

  test('Should run reads before writes', function(done) {
    var fastdom = new FastDom();

    var read = sinon.spy(function() {
      assert(!write.called);
    });

    var write = sinon.spy(function() {
      assert(read.called);
      done();
    });

    fastdom.read(read);
    fastdom.write(write);
  });

  test('Should call all reads together, followed by all writes', function(done) {
    var fastdom = new FastDom();
    var read1 = sinon.spy();
    var read2 = sinon.spy();
    var write1 = sinon.spy();
    var write2 = sinon.spy();

    // Assign unsorted
    fastdom.read(read1);
    fastdom.write(write1);
    fastdom.read(read2);
    fastdom.write(write2);

    // After the queue has been emptied
    // check the callbacks were called
    // in the correct order.
    raf(function() {
      assert(read1.calledBefore(read2));
      assert(read2.calledBefore(write1));
      assert(write1.calledBefore(write2));
      done();
    });
  });

  test('Should call a read in the same frame if scheduled inside a read callback', function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();

    fastdom.read(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      fastdom.read(function() {
        assert(!cb.called);
        done();
      });

      // Should not have scheduled a new frame
      assert(fastdom.frames.length === 0);
    });
  });

  test('Should call a write in the same frame if scheduled inside a read callback', function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();

    fastdom.read(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      fastdom.write(function() {
        assert(!cb.called);
        done();
      });

      // Should not have scheduled a new frame
      assert(fastdom.frames.length === 0);
    });
  });

  test('Should call a read in the *next* frame if scheduled inside a write callback', function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();

    fastdom.write(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read that should be
      // called in the next frame, meaning
      // the test callback should have already
      // been called.
      fastdom.read(function() {
        assert(cb.called);
        done();
      });

      // Should have scheduled a new frame
      assert(fastdom.frames.length === 1, 'the is one pending frame');
    });
  });

  test('Should not request a new frame when a write is requested inside a nested read', function(done) {
    var fastdom = new FastDom();
    var callback = sinon.spy();

    fastdom.write(function() {
      fastdom.read(function() {

        // Schedule a callback for *next* frame
        raf(callback);

        // Schedule a read callback
        // that should be run in the
        // current frame checking that
        // the RAF callback has not
        // yet been fired.
        fastdom.write(function() {
          assert(!callback.called);
          done();
        });

        // Should not have scheduled a new frame
        assert(fastdom.frames.length === 0);
      });
    });
  });

  test('Should schedule a new frame when a read is requested in a nested write', function(done) {
    var fastdom = new FastDom();

    fastdom.read(function() {
      fastdom.write(function() {
        fastdom.read(function(){});

        // Should have scheduled a new frame
        assert(fastdom.frames.length === 1);
        done();
      });
    });
  });

  test('Should run nested reads in the same frame', function(done) {
    var fastdom = new FastDom();
    var callback = sinon.spy();

    fastdom.read(function() {
      fastdom.read(function() {
        fastdom.read(function() {
          fastdom.read(function() {

            // Should not have scheduled a new frame
            assert(fastdom.frames.length === 0);
            done();
          });
        });
      });
    });
  });

  test('Should run nested writes in the same frame', function(done) {
    var fastdom = new FastDom();
    var callback = sinon.spy();

    fastdom.write(function() {
      fastdom.write(function() {
        fastdom.write(function() {
          fastdom.write(function() {

            // Should not have scheduled a new frame
            assert(fastdom.frames.length === 0);
            done();
          });
        });
      });
    });
  });

  test('Should call a "read" callback with the given context', function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    fastdom.read(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });

  test('Should call a "write" callback with the given context', function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    fastdom.write(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });

  test('Should have empty job hash when batch complete', function(done) {
    var fastdom = new FastDom();

    fastdom.read(function(){});
    fastdom.read(function(){});
    fastdom.write(function(){});
    fastdom.write(function(){});

    // Check there are four jobs stored
    assert.equal(objectLength(fastdom.batch.hash), 4);

    raf(function() {
      assert.equal(objectLength(fastdom.batch.hash), 0);
      done();
    });
  });

  test('Should maintain correct context if single method is registered twice', function(done) {
    var fastdom = new FastDom();
    var ctx1 = { foo: 'bar' };
    var ctx2 = { bar: 'baz' };

    function shared(){}

    var spy1 = sinon.spy(shared);
    var spy2 = sinon.spy(shared);

    fastdom.read(spy1, ctx1);
    fastdom.read(spy2, ctx2);

    raf(function() {
      assert(spy1.calledOn(ctx1));
      assert(spy2.calledOn(ctx2));
      done();
    });
  });

  test('Should run onError handler if one has been registered', function(done) {
    var fastdom = new FastDom();
    var err1 = { some: 'error1' };
    var err2 = { some: 'error2' };

    fastdom.onError = sinon.spy();

    fastdom.read(function() {
      throw err1;
    });

    fastdom.write(function() {
      throw err2;
    });

    raf(function() {
      assert(fastdom.onError.calledTwice);
      assert(fastdom.onError.getCall(0).calledWith(err1));
      assert(fastdom.onError.getCall(1).calledWith(err2));
      done();
    });
  });

  test('Should stop rAF loop once frame queue is empty', function(done) {
    var fastdom = new FastDom();
    var callback = sinon.spy();

    fastdom.read(callback);

    raf(function() {
      assert(callback.called);
      assert(fastdom.looping === false);
      done();
    });
  });


  test('Should continue to flush the queue until empty even if a job errors', function(done) {
    var fastdom = new FastDom();
    var read = sinon.spy();
    var write = sinon.spy();
    var flush = fastdom.runBatch;
    var error = sinon.stub().throws();
    var errorsThrown = false;

    sinon.stub(fastdom, 'runBatch', function() {
      try {
        flush.apply(fastdom, arguments);
      } catch (e) {
        errorsThrown = true;
      }
    });

    fastdom.read(read);
    fastdom.write(write);
    fastdom.read(error);
    fastdom.read(read);
    fastdom.write(error);
    fastdom.write(write);

    raf(function() {
      assert(read.calledTwice, 'the callback was called both times');
      assert(write.calledTwice, 'the callback was called both times');
      assert(fastdom.batch.read.length === 0, 'the queue is empty');
      assert(fastdom.batch.write.length === 0, 'the queue is empty');
      assert(errorsThrown, 'real errors were thrown');
      done();
    });
  });
});
