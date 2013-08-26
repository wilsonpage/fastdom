
buster.testCase('DomBatch', {

  "Should run reads before writes": function(done) {
    var dom = new DomBatch();

    var read = this.spy(function() {
      refute(write.called);
    });

    var write = this.spy(function() {
      assert(read.called);
      done();
    });

    dom.read(read);
    dom.write(write);
  },

  "Should call all reads together, followed by all writes": function(done) {
    var dom = new DomBatch();
    var read1 = this.spy();
    var read2 = this.spy();
    var write1 = this.spy();
    var write2 = this.spy();

    dom.read(read1);
    dom.write(write1);
    dom.read(read2);
    dom.write(write2);

    // After the queue has been emptied
    // check the callbacks were called
    // in the correct order.
    requestAnimationFrame(function() {
      assert(read1.calledBefore(read2));
      assert(read2.calledBefore(write1));
      assert(write1.calledBefore(write2));
      done();
    });
  },

  "Should call a read in the same frame if scheduled inside a read callback": function(done) {
    var dom = new DomBatch();
    var cb = this.spy();

    dom.read(function() {

      // Schedule a callback for *next* frame
      requestAnimationFrame(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      dom.read(function() {
        refute(cb.called);
        done();
      });
    });
  },

  "Should call a write in the same frame if scheduled inside a read callback": function(done) {
    var dom = new DomBatch();
    var cb = this.spy();

    dom.read(function() {

      // Schedule a callback for *next* frame
      requestAnimationFrame(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      dom.write(function() {
        refute(cb.called);
        done();
      });
    });
  },

  "Should call a read in the *next* frame if scheduled inside a write callback": function(done) {
    var dom = new DomBatch();
    var cb = this.spy();

    dom.write(function() {

      // Schedule a callback for *next* frame
      requestAnimationFrame(cb);

      // Schedule a write that should be
      // called in the next frame, meaning
      // the test callback should have already
      // been called.
      dom.read(function() {
        assert(cb.called);
        done();
      });
    });
  }


});