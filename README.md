# fastdom [![Build Status](https://travis-ci.org/wilsonpage/fastdom.svg?branch=master)](https://travis-ci.org/wilsonpage/fastdom)

Eliminates layout thrashing by batching DOM read/write operations (~750 bytes gzipped).

```js
fastdom.read(function() {
  console.log('read');
});

fastdom.write(function() {
  console.log('write');
});

fastdom.read(function() {
  console.log('read');
});

fastdom.write(function() {
  console.log('write');
});
```

Outputs:

```
read
read
write
write
```

## Examples

- [Animation example](http://wilsonpage.github.io/fastdom/examples/animation.html)
- [Aspect ratio example](http://wilsonpage.github.io/fastdom/examples/aspect-ratio.html)

## Installation

FastDom is CommonJS and AMD compatible, you can install it in one of the following ways:

``` sh
$ npm install fastdom
```
``` sh
$ bower install fastdom
```
``` sh
$ component install wilsonpage/fastdom
```
or [download](http://github.com/wilsonpage/fastdom/raw/master/index.js).

## How it works

FastDom works as a regulatory layer between your app/library and the DOM. By batching DOM access we **avoid unnecessary document reflows and speed up layout perfomance dramatically**.

Each read/write job is added to a corresponding read/write queue. The queues are emptied (reads, then writes) at the turn of the next frame using [`window.requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame).

FastDom aims to behave like a singleton across *all* modules in your app. When any module requires `'fastdom'` they  get the same instance back, meaning FastDom can harmonize DOM access app-wide.

Potentially a third-party library could depend on FastDom, and better integrate within an app that itself uses it.

## API

### FastDom#read(callback[, context])

Schedules a job for the 'read' queue. Returns a unique ID that can be used to clear the scheduled job.

```js
fastdom.read(function() {
  var width = element.clientWidth;
});
```

### FastDom#write(callback[, context])

Schedules a job for the 'write' queue. Returns a unique ID that can be used to clear the scheduled job.

```js
fastdom.write(function() {
  element.style.width = width + 'px';
});
```

### FastDom#defer([frames,] callback[, context])

Defers a job for the number of frames specified. This is useful if you have a particualrly expensive piece of work to do, and don't want it to be done with all the other work.

For example; you are using third party library that doesn't expose an API that allows you split DOM read/write work, `fastdom.defer()` will push this work futher into the future and prevent it from disrupting other carefully batched work.

```js
fastdom.defer(3, expensiveStuff);
```

`FastDom#defer` can also be called without the `frames` argument to push work onto next available frame.

```js
// Runs in frame 1
fastdom.defer(expensiveStuff1);

// Runs in frame 2
fastdom.defer(expensiveStuff2);

// Runs in frame 3
fastdom.defer(expensiveStuff3);
```

### FastDom#clear(id)

Clears **any** scheduled job.

```js
var read = fastdom.read(function(){});
var write = fastdom.write(function(){});
var defer = fastdom.defer(4, function(){});

fastdom.clear(read);
fastdom.clear(write);
fastdom.clear(defer);
```

## Exceptions

FastDom is async, this can therefore mean that when a job comes around to being executed, the node you were working with may no longer be there. These errors are usually not critical, but they can cripple your app. FastDom allows you to register an `onError` handler. If `fastdom.onError` has been registered, FastDom will catch any errors that occur in your jobs, and run the handler instead.

```js
fastdom.onError = function(error) {
  // Do something if you want
};

```

## Tests

#### With PhantomJS

``` sh
$ npm install
$ npm test
```

#### Without PhantomJS

Open `test/index.html` in your browser.

## Author

- **Wilson Page** - [@wilsonpage](http://twitter.com/wilsonpage)

## Contributors

- **Wilson Page** - [@wilsonpage](http://twitter.com/wilsonpage)
- **George Crawford** - [@georgecrawford](http://github.com/georgecrawford)

## License

(The MIT License)

Copyright (c) 2013 Wilson Page <wilsonpage@me.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
