/*jshint maxlen:false*/
/*global suite, setup, teardown, test, assert, sinon, fastdomSandbox, fastdomPromised*/

suite('fastdom', function() {
  var raf = window.requestAnimationFrame;
  var fastdom;

  setup(function() {
    fastdom = new window.fastdom.constructor();
  });

  test('it runs reads before writes', function(done) {
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

  test('it calls all reads together, followed by all writes', function(done) {
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

  test('it calls a read in the same frame if scheduled inside a read callback', function(done) {
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

  test('it calls a write in the same frame if scheduled inside a read callback', function(done) {
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

  test('it calls a read in the *next* frame if scheduled inside a write callback', function(done) {
    var cb = sinon.spy();

    fastdom.mutate(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read that should be
      // called in the next frame, meaning
      // the test callback should have already
      // been called.
      fastdom.measure(function() {
        assert(cb.called);
        done();
      }, this);
    }, this);
  });

  test('it does not request a new frame when a write is requested inside a nested read', function(done) {
    var callback = sinon.spy();

    fastdom.mutate(function() {
      fastdom.measure(function() {

        // Schedule a callback for *next* frame
        raf(callback);

        // Schedule a read callback
        // that should be run in the
        // current frame checking that
        // the RAF callback has not
        // yet been fired.
        fastdom.mutate(function() {
          assert(!callback.called);
          done();
        });
      });
    });
  });

  test('it schedules a new frame when a read is requested in a nested write', function(done) {
    fastdom.raf = sinon.spy(fastdom, 'raf');

    fastdom.measure(function() {
      fastdom.mutate(function() {
        fastdom.measure(function(){

          // Should have scheduled a new frame
          assert(fastdom.raf.calledTwice);
          done();
        });
      });
    });
  });

  test('it runs nested reads in the same frame', function(done) {
    sinon.spy(fastdom, 'raf');

    fastdom.measure(function() {
      fastdom.measure(function() {
        fastdom.measure(function() {
          fastdom.measure(function() {

            // Should not have scheduled a new frame
            sinon.assert.calledOnce(fastdom.raf);
            done();
          });
        });
      });
    });
  });

  test('it runs nested writes in the same frame', function(done) {
    fastdom.raf = sinon.spy(fastdom, 'raf');

    fastdom.mutate(function() {
      fastdom.mutate(function() {
        fastdom.mutate(function() {
          fastdom.mutate(function() {

            // Should not have scheduled a new frame
            sinon.assert.calledOnce(fastdom.raf);
            done();
          });
        });
      });
    });
  });

  test('it calls a "read" callback with the given context', function(done) {
    fastdom.measure(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, { foo: 'bar' });
  });

  test('it calls a "write" callback with the given context', function(done) {
    fastdom.mutate(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, { foo: 'bar' });
  });

  test('it passes the given argument to a "read" callback without context', function(done) {
    fastdom.measure(function(arg) {
      assert.equal(arg, 'bar');
      done();
    }, null, 'bar');
  });

  test('it passes the given argument to a "write" callback without context', function(done) {
    fastdom.mutate(function(arg) {
      assert.equal(arg, 'bar');
      done();
    }, null, 'bar');
  });

  test('it passes the given argument to a "read" callback with context', function(done) {
    fastdom.measure(function(arg) {
      assert.equal(this.foo, 'bar');
      assert.equal(arg, 'baz');
      done();
    }, { foo: 'bar' }, 'baz');
  });

  test('it passes the given argument to a "write" callback with context', function(done) {
    fastdom.mutate(function(arg) {
      assert.equal(this.foo, 'bar');
      assert.equal(arg, 'baz');
      done();
    }, { foo: 'bar' }, 'baz');
  });

  test('it maintains the passed argument value in a "read" callback inside a loop', function(done) {
    var i = 2;
    do {
      if ( i === 1 ) {
        fastdom.measure(function ( arg ) {
          assert.equal(arg, 1);
          done();
        }, null, i);
      }
    } while ( i-- );
  });

  test('it maintains the passed argument value in a "write" callback inside a loop', function(done) {
    var i = 2;
    do {
      if ( i === 1 ) {
        fastdom.mutate(function ( arg ) {
          assert.equal(arg, 1);
          done();
        }, null, i);
      }
    } while ( i-- );
  });

  test('it has an empty job hash when batch complete', function(done) {
    var ran = 0;

    fastdom.measure(function(){ ran += 1; });
    fastdom.measure(function(){ ran += 2; });
    fastdom.mutate(function(){ ran += 4; });
    fastdom.mutate(function(){ ran += 8; });

    // Check there are four jobs stored
    assert.equal(ran, 0);

    raf(function() {
      assert.equal(ran, 15);
      done();
    });
  });

  test('it maintains correct context if single method is registered twice', function(done) {
    var ctx1 = { foo: 'bar' };
    var ctx2 = { bar: 'baz' };

    function shared() {}

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

  test('it runs .catch() handler on error if one has been registered', function(done) {
    fastdom.catch = sinon.spy();

    fastdom.measure(function() { throw 'err1'; });
    fastdom.mutate(function() { throw 'err2'; });

    raf(function() {
      raf(function() {
        assert(fastdom.catch.calledTwice, 'twice');
        assert(fastdom.catch.getCall(0).calledWith('err1'), 'bla');
        assert(fastdom.catch.getCall(1).calledWith('err2'), 'bl2');
        done();
      });
    });
  });

  suite('exceptions', function() {

    // temporarily disable mocha error detection
    setup(function() {
      this.onerror = window.onerror;
      window.onerror = null;
    });

    // re-enable mocha error detection
    teardown(function() {
      window.onerror = this.onerror;
    });

    test('it flushes remaining tasks in next frame if prior task throws', function(done) {
      var spy = sinon.spy();

      fastdom.measure(function() { throw new Error('error'); });
      fastdom.measure(spy);

      raf(function() {
        sinon.assert.notCalled(spy);
        raf(function() {
          sinon.assert.calledOnce(spy);
          done();
        });
      });
    });
  });

  test('it stops rAF loop once frame queue is empty', function(done) {
    var callback = sinon.spy();

    sinon.spy(fastdom, 'raf');
    fastdom.measure(callback);

    raf(function() {
      assert(callback.called);
      assert(fastdom.raf.calledOnce);
      done();
    });
  });

  suite('clear', function() {
    test('it does not run "read" job if cleared (sync)', function(done) {
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

    test('it fails silently if job not found in queue', function(done) {
      var read = sinon.spy();
      var read2 = sinon.spy();

      var id = fastdom.measure(read);
      fastdom.clear(id);

      raf(function() {
        assert(!read2.called);
        done();
      });
    });

    test('it does not run "write" job if cleared (async)', function(done) {
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

    test('it does not run "write" job if cleared', function(done) {
      var write = sinon.spy();
      var id = fastdom.mutate(write);

      fastdom.clear(id);

      raf(function() {
        assert(!write.called);
        done();
      });
    });

    test('it removes reference to the job if cleared', function(done) {
      var write = sinon.spy();
      var id = fastdom.mutate(write);

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

  suite('FastDom#extend()', function() {
    test('it has the properties of given object', function() {
      var fastdom2 = fastdom.extend({ prop: 'foo' });
      assert.equal(fastdom2.prop, 'foo');
    });

    test('it can extend an extension', function() {
      var fastdom2 = fastdom.extend({ prop: 'foo' });
      var fastdom3 = fastdom2.extend({ prop: 'bar' });

      assert.equal(fastdom2.prop, 'foo');
      assert.equal(fastdom3.prop, 'bar');

      assert.equal(fastdom2.fastdom, fastdom);
      assert.equal(fastdom3.fastdom, fastdom2);
    });

    test('it throws if argument is not object', function() {
      assert.throws(function() {
        fastdom.extend();
      });

      assert.throws(function() {
        fastdom.extend('oopsie');
      });

      assert.throws(function() {
        fastdom.extend(999);
      });
    });

    test('it only mixes in own properties', function() {
      var proto = { foo: 'foo' };
      var extension = Object.create(proto);
      var extended = fastdom.extend(extension);

      assert.isUndefined(extended.foo);
    });
  });
});
