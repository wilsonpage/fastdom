
// RequestAnimationFrame Polyfill
var raf = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || function(cb) { window.setTimeout(cb, 1000 / 60); };

var DomBatch = dom.constructor;