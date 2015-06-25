# stream-buffer

Create a writable stream that will save all data written to a buffer.
The buffer can be "replayed" into another writable stream at any time.

The buffer stream will have a `stream.replay()` method which works like
`stream.pipe()` but will re-write all data regardless of when the
function is called.

# Example

```js
var buffer = require("buffer");
var stream = require("fs")
	.createReadStream("file")
	.pipe(buffer());

setTimeout(function() {
	// At any time ...
	// Replay the buffer into another writable stream and receive all
	// data events from the very first one to the "end" event
	stream.replay(require("fs").createWriteStream("file"));
}, 100);
```

# Installation 

```
npm install stream-buffer
```
