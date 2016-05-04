/*global suite, setup, test, assert, sinon, fastdomPromised*/
/*jshint maxlen:false*/

suite('fastdom-promised', function() {
  var fastdom;

  setup(function() {
    fastdom = window.fastdom.extend(fastdomPromised);
  });

  test('it returns a Promise that resolves after the task is run', function(done) {
    var spy = sinon.spy();

    fastdom.measure(spy)
      .then(function() {
        sinon.assert.calledOnce(spy);
        done();
      });
  });

  test('promises can be returned from tasks', function() {
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();

    return fastdom.measure(function() {
        spy1();
        return fastdom.mutate(spy2);
      })

      .then(function() {
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(spy2);
        assert.isTrue(spy1.calledBefore(spy2));
      });
  });

  test('calling `fastdom.clear(promise)` works', function(done) {
    var spy = sinon.spy();
    var task = fastdom.measure(spy);

    fastdom.clear(task);

    requestAnimationFrame(function() {
      sinon.assert.notCalled(spy);
      done();
    });
  });

  test('it calls callback with given context', function() {
    var spy = sinon.spy();
    var ctx = {};

    return fastdom.measure(spy, ctx)
      .then(function() {
        sinon.assert.calledOn(spy, ctx);
      });
  });
});
