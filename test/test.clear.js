
suite('Clear', function(){

  test("Should not run 'read' job if cleared (sync)", function(done) {
    var dom = new DomBatch();
    var read = sinon.spy();

    dom.read(read);
    dom.clearRead(read);

    raf(function() {
      assert(!read.called);
      done();
    });
  });

  test("Should fail silently if job not found in queue", function(done) {
    var dom = new DomBatch();
    var read = sinon.spy();
    var read2 = sinon.spy();

    dom.read(read);
    dom.clearRead(read2);

    raf(function() {
      assert(!read2.called);
      done();
    });
  });

  test("Should not run 'write' job if cleared (async)", function(done) {
    var dom = new DomBatch();
    var read = sinon.spy();
    var write = sinon.spy();

    dom.write(write);
    dom.read(function() {
      dom.clearWrite(write);

      raf(function() {
        assert(!read.called);
        done();
      });
    });
  });

  test("Should not run 'write' job if cleared", function(done) {
    var dom = new DomBatch();
    var write = sinon.spy();

    dom.write(write);
    dom.clearWrite(write);

    raf(function() {
      assert(!write.called);
      done();
    });
  });

});