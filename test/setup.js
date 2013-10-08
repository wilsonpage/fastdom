
// RequestAnimationFrame Polyfill
var raf = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || function(cb) { window.setTimeout(cb, 1000 / 60); };

// Make constructor
var FastDom = fastdom.constructor;

// Alias chai.assert
var assert = chai.assert;

function objectLength(object) {
  var l = 0;
  for (var key in object) l++;
  return l;
}