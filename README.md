# dom-batch [![Build Status](https://travis-ci.org/wilsonpage/dom-batch.png?branch=master)](https://travis-ci.org/wilsonpage/dom-batch)

Eliminates layout thrashing by batching DOM read/write interactions.

```js
var dom = new DomBatch();

dom.read(function() {
  console.log('<DOM Read>');
});

dom.write(function() {
  console.log('<DOM Write>');
});

dom.read(function() {
  console.log('<DOM Read>');
});

dom.write(function() {
  console.log('<DOM Write>');
});

// Output:

<DOM Read>
<DOM Read>
<DOM Write>
<DOM Write>
```

## Installation

DOM-Batch is CommonJS and AMD compatible, you can install it in one of the follwing ways:

```
$ npm install dom-batch
```

or

```
$ bower install dom-batch
```

or

Old fashioned [download](http://github.com/wilsonpage/dom-batch/raw/master/lib/dom-batch.js).

## How it works

DOM-Batch works as a regulatory layer between your app/library and the DOM. By batching DOM access we **avoid unnecessary document reflows and speed up layout perfomance dramatically**.

Each read/write job is added to a corresponding read/write queue. The queues are emptied (reads, then writes) at the turn of the next frame using [`window.requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame).

DOM-Batch aims to behave like a singleton across *all* modules in your app. When any module requires `'dom-batch'` they  get the same instance back, meaning DOM-Batch can harmonize app-wide DOM access. Potentially a third-party library could depend on DOM-Batch, and better intrgrate within an app that itself uses it.

## API

### DomBatch#read(callback[, context])

Schedules a task for the 'read' queue.

```js
dom.read(function() {
  var width = element.clientWidth;
});
```

### DomBatch#write(callback[, context])

Schedules a task for the 'write' queue.

```js
dom.write(function() {
  element.style.width = width + 'px';
});
```

### DomBatch#clearRead(callback)

Removes a task from the 'read' queue.

```js
var fn = function(){};

dom.read(fn);
dom.clearRead(fn);
```

### DomBatch#clearWrite(callback)

Removes a task from the 'write' queue.

```js
var fn = function(){};

dom.write(fn);
dom.clearWrite(fn);
```

## Tests

#### With PhantomJS

```
$ npm install
$ npm test
```

#### Without PhantomJS

```
$ node_modules/.bin/buster-static
```

...then visit http://localhost:8282/ in browser

## Author

- **Wilson Page** - [@wilsonpage](http://github.com/wilsonpage)

## Contributors

- **Wilson Page** - [@wilsonpage](http://github.com/wilsonpage)
- **George Crawford** - [@georgecrawford](http://github.com/georgecrawford)