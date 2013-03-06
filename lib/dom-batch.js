(function() {
  var domBatch = {};
  var reads = [];
  var writes = [];
  var batch;

  function call(fns) {
    var fn;
    while (fn = fns.shift()) fn();
  }

  domBatch.read = function(fn) {
    batch = batch || setBatch();
    reads.push(fn);
  };

  domBatch.write = function(fn) {
    batch = batch || setBatch();
    writes.push(fn);
  };

  function setBatch() {
    return setTimeout(function() {
      call(reads);
      call(writes);
      batch = null;
    }, 0);
  }

  // Expose the library
  if (typeof exports === "object") {
    module.exports = domBatch;
  } else if (typeof define === "function" && define.amd) {
    define(domBatch);
  } else {
    window['domBatch'] = domBatch;
  }
}());