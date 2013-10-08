
suite('defer', function(){

  test("Should run the job after the specified number of frames", function(done) {
    var fastdom = new FastDom();
    var job = sinon.spy();

    fastdom.defer(4, job);

    raf(function() {
      assert(!job.called);
      raf(function() {
        assert(!job.called);
        raf(function() {
          assert(!job.called);
          raf(function() {
            assert(job.called);
            done();
          });
        });
      });
    });
  });

  test("Should call a deferred callback with the given context", function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    fastdom.defer(2, function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });

  test("Should remove the reference to the job once run", function(done) {
    var fastdom = new FastDom();
    var callback = sinon.spy();
    var id = fastdom.defer(2, callback);

    raf(function() {
      raf(function() {
        raf(function() {
          assert(!fastdom.jobs[id]);
          done();
        });
      });
    });
  });
});
