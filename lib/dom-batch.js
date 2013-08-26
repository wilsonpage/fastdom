
;(function(){

  'use strict';

  /**
   * Creates a new
   * DomBatch instance.
   *
   * (you should only have one
   * instance per application).
   *
   * @constructor
   */
  function DomBatch() {
    this.reads = [];
    this.writes = [];

    this.mode = null;
    this.pending = false;

    // Bind context
    this.run = this.run.bind(this);
    this.frame = this.frame.bind(this);
  }

  /**
   * Adds a job to
   * the read queue.
   *
   * @param  {Function} fn
   * @api public
   */
  DomBatch.prototype.read = function(fn) {
    this.reads.push(fn);
    this.request('read');
  };

  /**
   * Adds a job to
   * the write queue.
   *
   * @param  {Function} fn
   * @api public
   */
  DomBatch.prototype.write = function(fn) {
    this.writes.push(fn);
    this.request('write');
  };

  /**
   * Makes the decision as to
   * whether a the frame needs
   * to be scheduled.
   *
   * @param  {String} type
   * @api private
   */
  DomBatch.prototype.request = function(type) {

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

    // Schedule frame
    requestAnimationFrame(this.frame);

    // Set flag to indicate
    // a frame has been scheduled
    this.pending = true;
  };

  /**
   * Calls each job in
   * the list passed.
   *
   * @param  {Array} list
   * @api private
   */
  DomBatch.prototype.run = function(list) {
    while (list.length) {
      list.shift().call(this);
    }
  };

  /**
   * Runs any read jobs followed
   * by any write jobs.
   *
   * @api private
   */
  DomBatch.prototype.frame = function() {

    // Set the pending flag to
    // false so that any new requests
    // that come in will schedule a new frame
    this.pending = false;

    // Set the mode to 'reading' so
    // that we know we can add more
    // reads to the queue instead of
    // scheduling a new frame.
    this.mode = 'reading';
    this.run(this.reads);

    // Set
    this.mode = 'writing';
    this.run(this.writes);

    this.mode = null;
  };

  /**
   * Expose 'DomBatch'
   */

  if (typeof exports === "object") {
    module.exports = DomBatch;
  } else if (typeof define === "function" && define.amd) {
    define(function(){ return DomBatch; });
  } else {
    window['DomBatch'] = DomBatch;
  }

})();
