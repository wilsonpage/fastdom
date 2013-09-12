
suite('defer', function(){

  test("Should run the job after the specified number of frames", function(done) {
    var fastdom = new FastDom();
    var job = sinon.spy();

    fastdom.defer(job, 4);

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
});