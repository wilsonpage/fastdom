
suite('Set', function() {

  test("Should run reads before writes", function(done) {
    var dom = new DomBatch();

    var read = sinon.spy(function() {
      assert(!write.called);
    });

    var write = sinon.spy(function() {
      assert(read.called);
      done();
    });

    dom.read(read);
    dom.write(write);
  });

  test("Should call all reads together, followed by all writes", function(done) {
    var dom = new DomBatch();
    var read1 = sinon.spy();
    var read2 = sinon.spy();
    var write1 = sinon.spy();
    var write2 = sinon.spy();

    // Assign unsorted
    dom.read(read1);
    dom.write(write1);
    dom.read(read2);
    dom.write(write2);

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

  test("Should call a read in the same frame if scheduled inside a read callback", function(done) {
    var dom = new DomBatch();
    var cb = sinon.spy();

    dom.read(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      dom.read(function() {
        assert(!cb.called);
        done();
      });
    });
  });

  test("Should call a write in the same frame if scheduled inside a read callback", function(done) {
    var dom = new DomBatch();
    var cb = sinon.spy();

    dom.read(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      dom.write(function() {
        assert(!cb.called);
        done();
      });
    });
  });

  test("Should call a read in the *next* frame if scheduled inside a write callback", function(done) {
    var dom = new DomBatch();
    var cb = sinon.spy();

    dom.write(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a write that should be
      // called in the next frame, meaning
      // the test callback should have already
      // been called.
      dom.read(function() {
        assert(cb.called);
        done();
      });
    });
  });

  test("Should call a 'read' callback with the given context", function(done) {
    var dom = new DomBatch();
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    dom.read(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });

  test("Should call a 'write' callback with the given context", function(done) {
    var dom = new DomBatch();
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    dom.write(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });
});