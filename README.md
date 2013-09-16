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

Schedules a task for the 'read' queue.

```js
fastdom.read(function() {
  var width = element.clientWidth;
});
```

### FastDom#write(callback[, context])

Schedules a task for the 'write' queue.

```js
fastdom.write(function() {
  element.style.width = width + 'px';
});
```

### FastDom#clearRead(callback)

Removes a task from the 'read' queue.

```js
var fn = function(){};

fastdom.read(fn);
fastdom.clearRead(fn);
```

### FastDom#clearWrite(callback)

Removes a task from the 'write' queue.

```js
var fn = function(){};

fastdom.write(fn);
fastdom.clearWrite(fn);
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