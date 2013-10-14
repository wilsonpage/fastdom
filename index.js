
/**
 * FastDom
 *
 * Eliminates layout thrashing
 * by batching DOM read/write
 * interactions.
 *
 * @author Wilson Page <wilsonpage@me.com>
 */

;(function(fastdom){

  'use strict';

  // Normalize rAF
  var raf = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(cb) { return window.setTimeout(cb, 1000 / 60); };

  // Normalize cAF
  var caf = window.cancelAnimationFrame
    || window.cancelRequestAnimationFrame
    || window.mozCancelAnimationFrame
    || window.mozCancelRequestAnimationFrame
    || window.webkitCancelAnimationFrame
    || window.webkitCancelRequestAnimationFrame
    || window.msCancelAnimationFrame
    || window.msCancelRequestAnimationFrame
    || function(id) { window.clearTimeout(id); };

  /**
   * Creates a fresh
   * FastDom instance.
   *
   * @constructor
   */
  function FastDom() {
    this.frames = [];
    this.lastId = 0;
    this.mode = null;
    this.queue = {
      hash: {},
      read: [],
      write: []
    };
  }

  /**
   * Adds a job to
   * the read queue.
   *
   * @param  {Function} fn
   * @api public
   */
  FastDom.prototype.read = function(fn, ctx) {
    var job = this.add('read', fn, ctx);
    var mode = this.mode;

    this.queue.read.push(job.id);

    // If we're writing and a 'read'
    // job comes in, we do have to
    // schedule a new frame
    var needsFrame = !this.batchPending || mode === 'writing';

    // Schedule a new frame if need be
    if (needsFrame) this.scheduleBatch();

    return job.id;
  };

  /**
   * Adds a job to
   * the write queue.
   *
   * @param  {Function} fn
   * @api public
   */
  FastDom.prototype.write = function(fn, ctx) {
    var job = this.add('write', fn, ctx);

    this.queue.write.push(job.id);

    // If we're emptying the read
    // queue and a write come in,
    // we don't need to schedule a
    // new frame. If we're writing
    // and write comes in we don't
    // need to schedule a new frame
    var needsFrame = !this.batchPending;

    // Schedule a new frame if need be
    if (needsFrame) this.scheduleBatch();

    return job.id;
  };

  /**
   * Defers the given job
   * by the number of frames
   * specified.
   *
   * @param  {Number}   frame
   * @param  {Function} fn
   * @api public
   */
  FastDom.prototype.defer = function(frame, fn, ctx) {

    // Accepts two arguments
    if (typeof frame === 'function') {
      ctx = fn;
      fn = frame;
      frame = 1;
    }

    var self = this;
    var index = frame - 1;

    return this.schedule(index, function() {
      self.run({
        fn: fn,
        ctx: ctx
      });
    });
  };

  /**
   * Clears a scheduled 'read',
   * 'write' or 'defer' job.
   *
   * @param  {Number} id
   * @api public
   */
  FastDom.prototype.clear = function(id) {

    // Defer jobs are cleared differently
    if (typeof id === 'function') {
      return this.clearFrame(id);
    }

    var job = this.queue.hash[id];
    if (!job) return;

    var list = this.queue[job.type];
    var index = list.indexOf(id);

    // Clear references
    delete this.queue.hash[id];
    if (~index) list.splice(index, 1);
  };

  /**
   * Clears a scheduled frame.
   *
   * @param  {Function} frame
   * @api private
   */
  FastDom.prototype.clearFrame = function(frame) {
    var index = this.frames.indexOf(frame);
    if (~index) this.frames.splice(index, 1);
  };

  /**
   * Schedules a new read/write
   * batch if one isn't pending.
   *
   * @api private
   */
  FastDom.prototype.scheduleBatch = function() {
    var self = this;

    // Schedule batch for next frame
    this.schedule(0, function() {
      self.runBatch();
      self.batchPending = false;
    });

    // Set flag to indicate
    // a frame has been scheduled
    this.batchPending = true;
  };

  /**
   * Generates a unique
   * id for a job.
   *
   * @return {Number}
   * @api private
   */
  FastDom.prototype.uniqueId = function() {
    return ++this.lastId;
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
  FastDom.prototype.flush = function(list) {
    var id;
    while (id = list.shift()) {
      this.run(this.queue.hash[id]);
    }
  };

  /**
   * Runs any read jobs followed
   * by any write jobs.
   *
   * @api private
   */
  FastDom.prototype.runBatch = function() {

    // Set the mode to 'reading',
    // then empty all read jobs
    this.mode = 'reading';
    this.flush(this.queue.read);

    // Set the mode to 'writing'
    // then empty all write jobs
    this.mode = 'writing';
    this.flush(this.queue.write);

    this.mode = null;
  };

  /**
   * Adds a new job to
   * the given queue.
   *
   * @param {Array}   list
   * @param {Function} fn
   * @param {Object}   ctx
   * @returns {Number} id
   * @api private
   */
  FastDom.prototype.add = function(type, fn, ctx) {
    var id = this.uniqueId();
    return this.queue.hash[id] = {
      id: id,
      fn: fn,
      ctx: ctx,
      type: type
    };
  };

  /**
   * Runs a given job.
   *
   * @param  {Object} job
   * @api private
   */
  FastDom.prototype.run = function(job){
    var ctx = job.ctx || this;

    // Clear reference to the job
    delete this.queue.hash[job.id];

    if (this.quiet) {
      try { job.fn.call(ctx); } catch (e) {}
    } else {
      job.fn.call(ctx);
    }
  };

  /**
   * Starts of a rAF loop
   * to empty the frame queue.
   *
   * @api private
   */
  FastDom.prototype.loop = function() {
    var self = this;

    // Don't start more than one loop
    if (this.looping) return;

    raf(function frame() {
      var fn = self.frames.shift();

      // Run the frame
      if (fn) fn();

      // If no more frames,
      // stop looping
      if (!self.frames.length) {
        self.looping = false;
        return;
      }

      raf(frame);
    });

    this.looping = true;
  };

  /**
   * Adds a function to
   * a specified index
   * of the frame queue.
   *
   * @param  {Number}   index
   * @param  {Function} fn
   * @return {Function}
   */
  FastDom.prototype.schedule = function(index, fn) {

    // Make sure this slot
    // hasn't already been
    // taken. If it has, try
    // re-scheduling for the next slot
    if (this.frames[index]) {
      return this.schedule(index + 1, fn);
    }

    // Start the rAF
    // loop to empty
    // the frame queue
    this.loop();

    // Insert this function into
    // the frames queue and return
    return this.frames[index] = fn;
  };

  // We only ever want there to be
  // one instance of FastDom in an app
  fastdom = fastdom || new FastDom();

  /**
   * Expose 'fastdom'
   */

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fastdom;
  } else if (typeof define === 'function' && define.amd) {
    define(function(){ return fastdom; });
  } else {
    window['fastdom'] = fastdom;
  }

})(window.fastdom);
