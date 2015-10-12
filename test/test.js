
suite('fastdom', function() {
  var fastdom;

  setup(function() {
    fastdom = new FastDom();
  });

  test('Should run reads before writes', function(done) {
    var read = sinon.spy(function() {
      assert(!write.called);
    });

    var write = sinon.spy(function() {
      assert(read.called);
      done();
    });

    fastdom.measure(read);
    fastdom.mutate(write);
  });

  test('Should call all reads together, followed by all writes', function(done) {
    var read1 = sinon.spy();
    var read2 = sinon.spy();
    var write1 = sinon.spy();
    var write2 = sinon.spy();

    // Assign unsorted
    fastdom.measure(read1);
    fastdom.mutate(write1);
    fastdom.measure(read2);
    fastdom.mutate(write2);

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
    var cb = sinon.spy();

    fastdom.measure(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      fastdom.measure(function() {
        assert(!cb.called);
        done();
      }, this);
    }, this);
  });

  test('Should call a write in the same frame if scheduled inside a read callback', function(done) {
    var cb = sinon.spy();

    fastdom.measure(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      fastdom.mutate(function() {
        assert(!cb.called);
        done();
      }, this);
    }, this);
  });

  test('Should call a read in the *next* frame if scheduled inside a write callback', function(done) {
    var cb = sinon.spy();
    var cb2 = sinon.spy();

    fastdom.mutate(function() {

      // Schedule a callback for *next* frame
      raf(cb);
      setTimeout(cb2);

      // Schedule a read that should be
      // called in the next frame, meaning
      // the test callback should have already
      // been called.
      fastdom.measure(function() {
        assert(!cb.called);
        assert(cb2.called);
        done();
      }, this);
    }, this);
  });

  test('Should not request a new frame when a write is requested inside a nested read', function(done) {
    var callback = sinon.spy();

    fastdom.mutate(function() {
      fastdom.measure(function() {

        // Schedule a read callback
        // that should be run in the
        // current frame checking that
        // the RAF callback has not
        // yet been fired.
        fastdom.mutate(function() {
          assert(!callback.called);
          done();
        });

        // Schedule a callback for *next* frame
        raf(callback);
      });
    });
  });

  test('Should schedule a new frame when a read is requested in a nested write', function(done) {
    var callback = sinon.spy();

    fastdom.measure(function() {
      fastdom.mutate(function() {
        fastdom.measure(function(){
          // Should have scheduled a new frame
          assert(!callback.called);
          done();
        });
        setTimeout(callback, 9);
      });
    });
  });

  test('Should run nested reads in the same frame', function(done) {
    var callback = sinon.spy();

    fastdom.raf = sinon.spy(fastdom, 'raf');

    fastdom.measure(function() {
      fastdom.measure(function() {
        fastdom.measure(function() {
          fastdom.measure(function() {

            // Should not have scheduled a new frame
            assert(fastdom.raf.calledOnce);
            done();
          });
        });
      });
    });
  });

  test('Should run nested writes in the same frame', function(done) {
    var callback = sinon.spy();

    fastdom.raf = sinon.spy(fastdom, 'raf');

    fastdom.mutate(function() {
      raf(callback);
      setTimeout(callback);
      fastdom.mutate(function() {
        fastdom.mutate(function() {
          fastdom.mutate(function() {

            // Should not have scheduled a new frame
            assert(callback.notCalled);
            done();
          });
        });
      });
    });
  });

  test('Should call a "read" callback with the given context', function(done) {
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    fastdom.measure(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });

  test('Should call a "write" callback with the given context', function(done) {
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    fastdom.mutate(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });

  test('Should have empty job hash when batch complete', function(done) {
    var ran = 0;

    fastdom.measure(function(){ran += 1;});
    fastdom.measure(function(){ran += 2;});
    fastdom.mutate(function(){ran += 4;});
    fastdom.mutate(function(){ran += 8;});

    // Check there are four jobs stored
    assert.equal(ran, 0);

    raf(function() {
      assert.equal(ran, 15);
      done();
    });
  });

  test('Should maintain correct context if single method is registered twice', function(done) {
    var ctx1 = { foo: 'bar' };
    var ctx2 = { bar: 'baz' };

    function shared(){}

    var spy1 = sinon.spy(shared);
    var spy2 = sinon.spy(shared);

    fastdom.measure(spy1, ctx1);
    fastdom.measure(spy2, ctx2);

    raf(function() {
      assert(spy1.calledOn(ctx1));
      assert(spy2.calledOn(ctx2));
      done();
    });
  });

  test('Should run .catch() handler if one has been registered', function(done) {
    fastdom.catch = sinon.spy();

    fastdom.measure(function() { throw 'err1'; });
    fastdom.mutate(function() { throw 'err2'; });

    raf(function() {
      raf(function() {
        assert(fastdom.catch.calledTwice,'twice');
        assert(fastdom.catch.getCall(0).calledWith('err1'),'bla');
        assert(fastdom.catch.getCall(1).calledWith('err2'),'bl2');
        done();
      });
    });
  });

  test('Should stop rAF loop once frame queue is empty', function(done) {
    var callback = sinon.spy();

    sinon.spy(fastdom, '_flush');
    fastdom.measure(callback);

    raf(function() {
      assert(callback.called);
      assert(fastdom._flush.calledOnce);
      done();
    });
  });

  suite('clear', function(){
    test('Should not run "read" job if cleared (sync)', function(done) {
      var read = sinon.spy();
      var id = fastdom.measure(read);
      fastdom.clear(id);

      raf(function() {
        raf(function() {
        assert(!read.called);
        done();
      });
      });
    });

    test('Should fail silently if job not found in queue', function(done) {
      var read = sinon.spy();
      var read2 = sinon.spy();

      var id = fastdom.measure(read);
      fastdom.clear(id);

      raf(function() {
        assert(!read2.called);
        done();
      });
    });

    test('Should not run "write" job if cleared (async)', function(done) {
      var read = sinon.spy();
      var write = sinon.spy();

      var id = fastdom.mutate(write);
      fastdom.measure(function() {
        fastdom.clear(id);

        raf(function() {
          assert(!read.called);
          done();
        });
      });
    });

    test('Should not run "write" job if cleared', function(done) {
      var write = sinon.spy();
      var id = fastdom.mutate(write);

      fastdom.clear(id);

      raf(function() {
        assert(!write.called);
        done();
      });
    });

    test('Should remove reference to the job if cleared', function(done) {
      var write = sinon.spy();
      var id = fastdom.mutate(2, write);

      fastdom.clear(id);

      raf(function() {
        raf(function() {
          raf(function() {
            assert(!write.called);
            done();
          });
        });
      });
    });
  });

  suite('sandbox', function() {
    test('It works as normal', function(done) {
      var sandbox = fastdom.sandbox();

      sandbox.measure(function() {
        sandbox.mutate(function() {
          done();
        });
      });
    });

    test('Its possible to clear all sandbox jobs', function(done) {
      var sandbox = fastdom.sandbox();
      var spy = sinon.spy();

      sandbox.measure(spy);
      sandbox.mutate(spy);

      fastdom.measure(function() {
        fastdom.mutate(function() {
          assert.isTrue(spy.notCalled);
          done();
        });
      });

      sandbox.clear();
    });

    test('It clears individual tasks', function(done) {
      var sandbox = fastdom.sandbox();
      var spy = sinon.spy();

      var task = sandbox.measure(spy);
      sandbox.clear(task);
      sandbox.measure(function() {
        assert.isTrue(spy.notCalled);
        done();
      });
    });
  });
});
