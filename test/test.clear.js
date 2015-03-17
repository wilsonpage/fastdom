
suite('clear', function(){

  test('Should not run "read" job if cleared (sync)', function(done) {
    var fastdom = new FastDom();
    var read = sinon.spy();

    var id = fastdom.read(read);
    fastdom.clear(id);

    raf(function() {
      assert(!read.called);
      done();
    });
  });

  test('Should fail silently if job not found in queue', function(done) {
    var fastdom = new FastDom();
    var read = sinon.spy();
    var read2 = sinon.spy();

    var id = fastdom.read(read);
    fastdom.clear(id);

    raf(function() {
      assert(!read2.called);
      done();
    });
  });

  test('Should not run "write" job if cleared (async)', function(done) {
    var fastdom = new FastDom();
    var read = sinon.spy();
    var write = sinon.spy();

    var id = fastdom.write(write);
    fastdom.read(function() {
      fastdom.clear(id);

      raf(function() {
        assert(!read.called);
        done();
      });
    });
  });

  test('Should not run "write" job if cleared', function(done) {
    var fastdom = new FastDom();
    var write = sinon.spy();
    var id = fastdom.write(write);

    fastdom.clear(id);

    raf(function() {
      assert(!write.called);
      done();
    });
  });

  test('Should not run "defer" job if cleared', function(done) {
    var fastdom = new FastDom();
    var callback = sinon.spy();
    var id = fastdom.defer(3, callback);

    fastdom.clear(id);

    raf(function() {
      raf(function() {
        raf(function() {
          raf(function() {
            assert(!callback.called);
            done();
          });
        });
      });
    });
  });

  test('Should remove reference to the job if cleared', function(done) {
    var fastdom = new FastDom();
    var write = sinon.spy();
    var id = fastdom.write(2, write);

    fastdom.clear(id);

    raf(function() {
      raf(function() {
        raf(function() {
          assert(!write.called);
          assert(!fastdom.batch.hash[id]);
          done();
        });
      });
    });
  });

  test('Should accept String ids', function(done) {
    var fastdom = new FastDom();
    var read = sinon.spy();

    var id = fastdom.read(read);

    fastdom.clear(id.toString());

    raf(function() {
      assert(!read.called);
      done();
    });
  });
});