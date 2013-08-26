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