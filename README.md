# fastdom [![Build Status](https://travis-ci.org/wilsonpage/fastdom.png?branch=master)](https://travis-ci.org/wilsonpage/fastdom)

Eliminates layout thrashing by batching DOM read/write operations.

```js
var fastdom = new FastDom();

fastdom.read(function() {
  console.log('<DOM Read>');
});

fastdom.write(function() {
  console.log('<DOM Write>');
});

fastdom.read(function() {
  console.log('<DOM Read>');
});

fastdom.write(function() {
  console.log('<DOM Write>');
});

// Output:

<DOM Read>
<DOM Read>
<DOM Write>
<DOM Write>
```

## Installation

FastDom is CommonJS and AMD compatible, you can install it in one of the follwing ways:

```
$ npm install fastdom
```

or

```
$ bower install fastdom
```

or

Old fashioned [download](http://github.com/wilsonpage/fastdom/raw/master/lib/fastdom.js).

## How it works

FastDom works as a regulatory layer between your app/library and the DOM. By batching DOM access we **avoid unnecessary document reflows and speed up layout perfomance dramatically**.

Each read/write job is added to a corresponding read/write queue. The queues are emptied (reads, then writes) at the turn of the next frame using [`window.requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame).

FastDom aims to behave like a singleton across *all* modules in your app. When any module requires `'fastdom'` they  get the same instance back, meaning FastDom can harmonize DOM access app-wide.

Potentially a third-party library could depend on FastDom, and better intrgrate within an app that itself uses it.

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

### FastDom#clearRead(id)

Removes a job from the 'read' queue by id.

```js
var id = fastdom.read(function(){});
fastdom.clearRead(id);
```

### FastDom#clearWrite(id)

Removes a job from the 'write' queue by id.

```js
var id = fastdom.write(function(){});
fastdom.clearWrite(id);
```

### FastDom#defer(callback, frames)

Defers a job for the number of frames specified. This is useful is you have a particualrly expensive piece of work to do, and don't want it to be done with all the other work.

For example; you are using third party library that doesn't expose an API that allows you split DOM read/write work, `fastdom.defer()` will push this work futher into the future and prevent it from disrupting other carefully batched work.

```js
fastdom.defer(expensiveStuff, 3);
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