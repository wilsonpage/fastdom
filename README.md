# DOM-Batch

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