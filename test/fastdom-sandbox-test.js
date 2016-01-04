/*global suite, setup, test, assert, sinon, fastdomSandbox, fastdomPromised*/
/* jshint maxlen:false */

suite('fastdom-sandbox', function() {
  var raf = window.requestAnimationFrame;
  var fastdom;

  setup(function() {
    fastdom = new window.fastdom.constructor();
    fastdom = fastdom.extend(window.fastdomSandbox);
  });

  test('It works as normal', function(done) {
    var sandbox = fastdom.sandbox();

    sandbox.measure(function() {
      sandbox.mutate(function() {
        done();
      });
    });
  });

  test('Its possible to clear all sandbox jobs', function(done) {
    var sandbox = fastdom.sandbox();
    var spy = sinon.spy();

    sandbox.measure(spy);
    sandbox.mutate(spy);

    fastdom.measure(function() {
      fastdom.mutate(function() {
        assert.isTrue(spy.notCalled);
        done();
      });
    });

    sandbox.clear();
  });

  test('It clears individual tasks', function(done) {
    var sandbox = fastdom.sandbox();
    var spy = sinon.spy();

    var task = sandbox.measure(spy);
    sandbox.clear(task);
    sandbox.measure(function() {
      assert.isTrue(spy.notCalled);
      done();
    });
  });

  test('it works with fastdom-promised', function(done) {
    var myFastdom = fastdom
      .extend(fastdomPromised)
      .extend(fastdomSandbox);

    var sandbox = myFastdom.sandbox();
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();

    sandbox.measure(spy1)
      .then(function() {
        return sandbox.mutate(spy2);
      })

      .then(function() {
        sinon.assert.calledOnce(spy1);
        sinon.assert.calledOnce(spy2);

        spy1.reset();
        spy2.reset();

        sandbox.measure(spy1);
        sandbox.measure(spy2);
        sandbox.clear();

        raf(function() {
          console.log(3);
          sinon.assert.notCalled(spy1);
          sinon.assert.notCalled(spy2);
          done();
        });
      })

      .catch(done);
  });
});
