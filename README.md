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