/**
 * FastDom
 *
 * Eliminates layout thrashing
 * by batching DOM read/write
 * interactions.
 *
 * @author Wilson Page <wilsonpage@me.com>
 * @author Kornel Lesinski <kornel.lesinski@ft.com>
 */

;(function(fastdom){

  'use strict';

  // Normalize rAF
  var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(cb) {
    return setTimeout(cb, 16);
  };

  /**
   * Creates a fresh
   * FastDom instance.
   *
   * @constructor
   */
  function FastDom() {
    // Placing the rAF method
    // on the instance allows
    // us to replace it with
    // a stub for testing.
    this.raf = raf.bind(window);

    this.reads = [];
    this.writes = [];
    this.deferred = [];

    this.onError = undefined;
    this.flush = this.flush.bind(this);
  }

  /**
   * Adds a job to the
   * read batch and schedules
   * a new frame if need be.
   *
   * @param  {Function} fn
   * @public
   */
  FastDom.prototype.read = function(fn, ctx) {
    var job = {fn: fn, ctx: ctx};
    this.reads.push(job);
    this.scheduleBatch();
    return job;
  };

  /**
   * Adds a job to the
   * write batch and schedules
   * a new frame if need be.
   *
   * @param  {Function} fn
   * @public
   */
  FastDom.prototype.write = function(fn, ctx) {
    var job = {fn: fn, ctx: ctx};
    this.writes.push(job);
    this.scheduleBatch();
    return job;
  };

  /**
   * Defers the given job
   * by the number of frames
   * specified.
   *
   * If no frames are given
   * then the job is run in
   * the next free frame.
   *
   * @param  {Number}   frame
   * @param  {Function} fn
   * @public
   */
  FastDom.prototype.defer = function(frame, fn, ctx) {

    // Accepts two arguments
    if (typeof frame === 'function') {
      ctx = fn;
      fn = frame;
      frame = 1;
    }

    var job;
    if (frame > 1) {
      var lastFn = fn;
      var that = this;
      fn = function() {
        if (--job.frame > 0) {
          that.deferred.push(job);
          that.scheduleBatch();
        } else {
          lastFn.call(job.ctx);
        }
      };
    }

    job = {fn: fn, ctx: ctx, frame: frame};
    this.deferred.push(job);
    this.scheduleBatch();
    return job;
  };

  /**
   * Clears a scheduled 'read',
   * 'write' or 'defer' job.
   *
   * @param {Object} id
   * @public
   */
  FastDom.prototype.clear = function(job) {
    var idx;
    idx = this.reads.indexOf(job);
    if (idx >= 0) {
      this.reads.splice(idx, 1);
      return;
    }
    idx = this.writes.indexOf(job);
    if (idx >= 0) {
      this.writes.splice(idx, 1);
      return;
    }
    idx = this.deferred.indexOf(job);
    if (idx >= 0) {
      this.deferred.splice(idx, 1);
      return;
    }
  };

  /**
   * Schedules a new read/write
   * batch if one isn't pending.
   *
   * @private
   */
  FastDom.prototype.scheduleBatch = function() {
    if (this.scheduled) return;
    this.scheduled = true;
    this.raf(this.flush);
  };

  FastDom.prototype.flush = function() {
    var start = Date.now();
    var error;

    var readBatchTimeLimit = 13; // Stop running more read jobs if frame took more than this many ms (fudge factor)
    var writeBatchTimeLimit = 9; // Spend less time on writes assuming browser will need time to process them
    var deferredTimeLimit = 12;

    try {
      if (this.runBatch(this.reads, 10000, start, readBatchTimeLimit)) {
        if (this.runBatch(this.writes, 10000, start, writeBatchTimeLimit)) {
          this.runBatch(this.deferred, this.deferred.length, start, deferredTimeLimit); // deferred.length ensures newly deferred jobs aren't run immediately
        }
      }
    } catch (e) {
      error = e;
    }

    this.scheduled = false;
    if (this.reads.length || this.writes.length || this.deferred.length) {
      this.scheduleBatch();
    }

    if (error) {
      if (this.onError) {
        this.onError(error);
      } else {
        throw error;
      }
    }
  };

  /**
   * Runs given jobs until frameTimeLimit (in ms) is reached
   *
   * We run this inside a try catch
   * so that if any jobs error, we
   * are able to recover and continue
   * to flush the batch until it's empty.
   *
   * @private
   */
  FastDom.prototype.runBatch = function(list, maxJobs, start, frameTimeLimit) {
    var job;
    while (maxJobs-- && (job = list.shift())) {
      job.fn.call(job.ctx);
      var took = Date.now() - start;
      if (took > frameTimeLimit) {
        // If it dropped below 30fps, then it's a jank, so at this point we may as well jank it all the way and flush the entire queue
        if (took > 30) {
          frameTimeLimit = 1e10;
          continue;
        }
        return false;
      }
    }
    return true;
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
