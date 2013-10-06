
/**
 * DOM-Batch
 *
 * Eliminates layout thrashing
 * by batching DOM read/write
 * interactions.
 *
 * @author Wilson Page <wilsonpage@me.com>
 */

;(function(){

  'use strict';

  // Normalize rAF
  var raf = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || function(cb) { window.setTimeout(cb, 1000 / 60); };

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

  var lastId = 0,
      jobs = {},
      mode = null,
      pending = false,
      readQueue = [],
      writeQueue = [];

  /**
   * Adds a job to
   * the read queue.
   *
   * @param  {Function} fn
   * @api public
   */
  var read = function(fn, ctx) {
    var job = _add('read', fn, ctx);
    readQueue.push(job.id);
    _request('read');
    return job.id;
  };

  /**
   * Adds a job to
   * the write queue.
   *
   * @param  {Function} fn
   * @api public
   */
  var write = function(fn, ctx) {
    var job = _add('write', fn, ctx);
    writeQueue.push(job.id);
    _request('write');
    return job.id;
  };

  /**
   * Removes a job from
   * the 'reads' queue.
   *
   * @param  {Number} id
   * @api public
   */
  var clear = function(id) {
    var job = jobs[id];
    if (!job) return;

    // Defer jobs are cleared differently
    if (job.type === 'defer') {
      caf(job.timer);
      return;
    }

    var list = ( job.type === 'read' ? readQueue : writeQueue );
    var index = list.indexOf(id);

    if (~index) list.splice(index, 1);
    delete jobs[id];
  };

  /**
   * Makes the decision as to
   * whether a the frame needs
   * to be scheduled.
   *
   * @param  {String} type
   * @api private
   */
  var _request = function(type) {
    // If we are currently writing, we don't
    // need to scedule a new frame as this
    // job will be emptied from the write queue
    if (mode === 'writing' && type === 'write') return;

    // If we are reading we don't need to schedule
    // a new frame as this read will be emptied
    // in the currently active read queue
    if (mode === 'reading' && type === 'read') return;

    // If we are reading we don't need to schedule
    // a new frame and this write job will be run
    // after the read queue has been emptied in the
    // currently active frame.
    if (mode === 'reading' && type === 'write') return;

    // If there is already a frame
    // scheduled, don't schedule another one
    if (pending) return;

    // Schedule frame (preserving context)
    raf(_frame);

    // Set flag to indicate
    // a frame has been scheduled
    pending = true;
  };

  /**
   * Generates a unique
   * id for a job.
   *
   * @return {Number}
   */
  var _uniqueId = function() {
    return ++lastId;
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
  var _run = function(list) {
    var ctx;
    var job;
    var id;

    while (id = list.shift()) {
      job = jobs[id];
      ctx = job.ctx || fastdom;
      delete jobs[id];
      try { job.fn.call(ctx); } catch (e) {
        if (fastdom.onError) fastdom.onError(e);
      }
    }
  };

  /**
   * Runs any read jobs followed
   * by any write jobs.
   *
   * @api private
   */
  var _frame = function() {

    // Set the pending flag to
    // false so that any new requests
    // that come in will schedule a new frame
    pending = false;

    // Set the mode to 'reading',
    // then empty all read jobs
    mode = 'reading';
    _run(readQueue);

    // Set the mode to 'writing'
    // then empty all write jobs
    mode = 'writing';
    _run(writeQueue);

    mode = null;
  };

  /**
   * Defers the given job
   * by the number of frames
   * specified.
   *
   * @param  {Number}   frames
   * @param  {Function} fn
   * @api public
   */
  var defer = function(frames, fn, ctx) {
    if (frames < 0) return;
    var job = _add('defer', fn);
    (function wrapped() {
      if (frames-- === 0) {
        try { fn.call(ctx); } catch(e) {
          if (fastdom.onError) fastdom.onError(e);
        }
      } else {
        job.timer = raf(wrapped);
      }
    })();
    return job.id;
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
  var _add = function(type, fn, ctx) {
    var id = _uniqueId();
    return jobs[id] = {
      id: id,
      fn: fn,
      ctx: ctx,
      type: type
    };
  };

  /**
   * Removes a job from
   * the given queue.
   * @param  {Array} list
   * @param  {Number} id
   * @api private
   */
  var _remove = function(list, id) {
    var index = list.indexOf(id);
    if (~index) list.splice(index, 1);
    delete jobs[id];
  };

  /**
   * Expose 'FastDom'
   */
  var fastdom = {
    read: read,
    write: write,
    clear: clear,
    defer: defer,

    // exposed properties (only necessary for testing?)
    jobs: jobs
  };

  if (typeof exports === "object") {
    module.exports = fastdom;
  } else if (typeof define === "function" && define.amd) {
    define(function(){ return fastdom; });
  } else {
    window['fastdom'] = fastdom;
  }

})();
