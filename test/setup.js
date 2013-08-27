
// RequestAnimationFrame Polyfill
var raf = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || function(cb) { window.setTimeout(cb, 1000 / 60); };

// Make constructor
var DomBatch = dom.constructor;

// Alias chai.assert
var assert = chai.assert;