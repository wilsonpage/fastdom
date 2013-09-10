
/**
 * DOM-Batch
 *
 * Eliminates layout thrashing
 * by batching DOM read/write
 * interactions.
 *
 * @author Wilson Page <wilsonpage@me.com>
 */

;(function(fastdom){

  'use strict';

  // RequestAnimationFrame Polyfill
  var raf = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || function(cb) { window.setTimeout(cb, 1000 / 60); };

  // Use existing instance if
  // one already exists in
  // this app, else make one.
  fastdom = (fastdom instanceof FastDom)
    ? fastdom
    : new FastDom();

  /**
   * Creates a fresh
   * FastDom instance.
   *
   * @constructor
   */
  function FastDom() {
    this.reads = [];
    this.writes = [];
    this.mode = null;
    this.pending = false;
  }

  /**
   * Adds a job to
   * the read queue.
   *
   * @param  {Function} fn
   * @api public
   */
  FastDom.prototype.read = function(fn, ctx) {
    add(this.reads, fn, ctx);
    this.request('read');
  };

  /**
   * Adds a job to
   * the write queue.
   *
   * @param  {Function} fn
   * @api public
   */
  FastDom.prototype.write = function(fn, ctx) {
    add(this.writes, fn, ctx);
    this.request('write');
  };

  /**
   * Removes a job from
   * the 'reads' queue.
   *
   * @param  {Function} fn
   * @api public
   */
  FastDom.prototype.clearRead = function(fn) {
    remove(this.reads, fn);
  };

  /**
   * Removes a job from
   * the 'writes' queue.
   *
   * @param  {Function} fn
   * @api public
   */
  FastDom.prototype.clearWrite = function(fn) {
    remove(this.writes, fn);
  };

  /**
   * Makes the decision as to
   * whether a the frame needs
   * to be scheduled.
   *
   * @param  {String} type
   * @api private
   */
  FastDom.prototype.request = function(type) {
    var self = this;

    // If we are currently writing, we don't
    // need to scedule a new frame as this
    // job will be emptied from the write queue
    if (this.mode === 'writing' && type === 'write') return;

    // If we are reading we don't need to schedule
    // a new frame as this read will be emptied
    // in the currently active read queue
    if (this.mode === 'reading' && type === 'read') return;

    // If we are reading we don't need to schedule
    // a new frame and this write job will be run
    // after the read queue has been emptied in the
    // currently active frame.
    if (this.mode === 'reading' && type === 'write') return;

    // If there is already a frame
    // scheduled, don't schedule another one
    if (this.pending) return;

    // Schedule frame (preserving context)
    raf(function() { self.frame(); });

    // Set flag to indicate
    // a frame has been scheduled
    this.pending = true;
  };

  /**
   * Calls each job in
   * the list passed.
   *
   * If a context has been
   * stored on the function
   * then it is used, else the
   * current `this` is used.
   *
   * @param  {Array} list
   * @api private
   */
  FastDom.prototype.run = function(list) {
    var fn;
    var ctx;

    while (list.length) {
      fn = list.shift();
      ctx = fn._dbctx || this;
      try {
        fn.call(ctx);
      } catch (err) {
        // TODO: console.error if options.silent === false.
      }
    }
  };

  /**
   * Runs any read jobs followed
   * by any write jobs.
   *
   * @api private
   */
  FastDom.prototype.frame = function() {

    // Set the pending flag to
    // false so that any new requests
    // that come in will schedule a new frame
    this.pending = false;

    // Set the mode to 'reading',
    // then empty all read jobs
    this.mode = 'reading';
    this.run(this.reads);

    // Set the mode to 'writing'
    // then empty all write jobs
    this.mode = 'writing';
    this.run(this.writes);

    this.mode = null;
  };

  /**
   * Util
   */

  /**
   * Adds a function to
   * the given array.
   *
   * If a context is given
   * it is stored on the
   * function object for
   * later.
   *
   * @param {Array}   array
   * @param {Function} fn
   * @param {Object}   ctx
   * @api private
   */
  function add(array, fn, ctx) {
    if (ctx) fn._dbctx = ctx;
    array.push(fn);
  }

  /**
   * Removes a function
   * from the given array.
   *
   * @param  {Array} array
   * @param  {Function} item
   * @api private
   */
  function remove(array, fn) {
    var index = array.indexOf(fn);
    if (~index) array.splice(index, 1);
  }

  /**
   * Expose 'FastDom'
   */

  if (typeof exports === "object") {
    module.exports = fastdom;
  } else if (typeof define === "function" && define.amd) {
    define(function(){ return fastdom; });
  } else {
    window['fastdom'] = fastdom;
  }

})(window.fastdom);