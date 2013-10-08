# fastdom [![Build Status](https://travis-ci.org/wilsonpage/fastdom.png?branch=master)](https://travis-ci.org/wilsonpage/fastdom)

Eliminates layout thrashing by batching DOM read/write operations (~750 bytes gzipped).

```js
var fastdom = new FastDom();

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

<<<<<<< HEAD
=======
- [Animation example](http://wilsonpage.github.io/fastdom/examples/animation.html)
>>>>>>> upstream/gh-pages
- [Aspect ratio example](http://wilsonpage.github.io/fastdom/examples/aspect-ratio.html)

## Installation

FastDom is CommonJS and AMD compatible, you can install it in one of the following ways:

```
$ npm install fastdom
```
```
$ bower install fastdom
```
```
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

### FastDom#defer(frames, callback[, context])

Defers a job for the number of frames specified. This is useful is you have a particualrly expensive piece of work to do, and don't want it to be done with all the other work.

For example; you are using third party library that doesn't expose an API that allows you split DOM read/write work, `fastdom.defer()` will push this work futher into the future and prevent it from disrupting other carefully batched work.

```js
fastdom.defer(3, expensiveStuff);
```

### FastDom#clear(id)

Clears **any** scheduled job by id.

```js
var read = fastdom.read(function(){});
var write = fastdom.write(function(){});
var defer = fastdom.defer(4, function(){});

fastdom.clear(read);
fastdom.clear(write);
fastdom.clear(defer);
```

## Tests

#### With PhantomJS

```
$ npm install
$ npm test
```

#### Without PhantomJS

Open `test/index.html` in your browser.

## Author

- **Wilson Page** - [@wilsonpage](http://github.com/wilsonpage)

## Contributors

- **Wilson Page** - [@wilsonpage](http://github.com/wilsonpage)
- **George Crawford** - [@georgecrawford](http://github.com/georgecrawford)

## License

(The MIT License)

Copyright (c) 2013 Wilson Page <wilsonpage@me.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.