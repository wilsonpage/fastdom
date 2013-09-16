
suite('Clear', function(){

  test("Should not run 'read' job if cleared (sync)", function(done) {
    var fastdom = new FastDom();
    var read = sinon.spy();

    fastdom.read(read);
    fastdom.clearRead(read);

    raf(function() {
      assert(!read.called);
      done();
    });
  });

  test("Should fail silently if job not found in queue", function(done) {
    var fastdom = new FastDom();
    var read = sinon.spy();
    var read2 = sinon.spy();

    fastdom.read(read);
    fastdom.clearRead(read2);

    raf(function() {
      assert(!read2.called);
      done();
    });
  });

  test("Should not run 'write' job if cleared (async)", function(done) {
    var fastdom = new FastDom();
    var read = sinon.spy();
    var write = sinon.spy();

    fastdom.write(write);
    fastdom.read(function() {
      fastdom.clearWrite(write);

      raf(function() {
        assert(!read.called);
        done();
      });
    });
  });

  test("Should not run 'write' job if cleared", function(done) {
    var fastdom = new FastDom();
    var write = sinon.spy();

    fastdom.write(write);
    fastdom.clearWrite(write);

    raf(function() {
      assert(!write.called);
      done();
    });
  });

});