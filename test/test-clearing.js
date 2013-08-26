
buster.testCase('DomBatch - Clearing', {

  "Should not run 'read' job if cleared (sync)": function(done) {
    var dom = new DomBatch();
    var read = this.spy();

    dom.read(read);
    dom.clearRead(read);

    raf(function() {
      refute(read.called);
      done();
    });
  },

  "Should fail silently if job not found in queue": function(done) {
    var dom = new DomBatch();
    var read = this.spy();
    var read2 = this.spy();

    dom.read(read);
    dom.clearRead(read2);

    raf(function() {
      refute(read2.called);
      done();
    });
  },

  "Should not run 'write' job if cleared (async)": function(done) {
    var dom = new DomBatch();
    var read = this.spy();
    var write = this.spy();

    dom.write(write);
    dom.read(function() {
      dom.clearWrite(write);

      raf(function() {
        refute(read.called);
        done();
      });
    });
  },

  "Should not run 'write' job if cleared": function(done) {
    var dom = new DomBatch();
    var write = this.spy();

    dom.write(write);
    dom.clearWrite(write);

    raf(function() {
      refute(write.called);
      done();
    });
  }

});