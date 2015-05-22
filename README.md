# fastdom [![Build Status](https://travis-ci.org/wilsonpage/fastdom.svg?branch=master)](https://travis-ci.org/wilsonpage/fastdom)

Eliminates layout thrashing by batching DOM read/write operations (~750 bytes gzipped).

```js
fastdom.meaure(function() {
  console.log('read');
});

fastdom.mutate(function() {
  console.log('write');
});

fastdom.meaure(function() {
  console.log('read');
});

fastdom.mutate(function() {
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

Each meaure/mutate job is added to a corresponding meaure/mutate queue. The queues are emptied (reads, then writes) at the turn of the next frame using [`window.requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame).

FastDom aims to behave like a singleton across *all* modules in your app. When any module requires `'fastdom'` they  get the same instance back, meaning FastDom can harmonize DOM access app-wide.

Potentially a third-party library could depend on FastDom, and better integrate within an app that itself uses it.

## API

### FastDom#measure(callback[, context])

Schedules a job for the 'measure' queue. Returns a unique ID that can be used to clear the scheduled job.

```js
fastdom.measure(function() {
  var width = element.clientWidth;
});
```

### FastDom#mutate(callback[, context])

Schedules a job for the 'mutate' queue. Returns a unique ID that can be used to clear the scheduled job.

```js
fastdom.mutate(function() {
  element.style.width = width + 'px';
});
```

### FastDom#clear(id)

Clears **any** scheduled job.

```js
var read = fastdom.meaure(function(){});
var write = fastdom.mutate(function(){});
var defer = fastdom.defer(4, function(){});

fastdom.clear(read);
fastdom.clear(write);
fastdom.clear(defer);
```

## Exceptions

FastDom is async, this can therefore mean that when a job comes around to being executed, the node you were working with may no longer be there. These errors are usually not critical, but they can cripple your app.

FastDom allows you to register an `catch` handler. If `fastdom.catch` has been registered, FastDom will catch any errors that occur in your jobs, and run the handler instead.

```js
fastdom.catch = function(error) {
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
