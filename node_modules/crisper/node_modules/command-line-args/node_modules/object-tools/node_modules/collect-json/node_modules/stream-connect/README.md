[![view on npm](http://img.shields.io/npm/v/stream-connect.svg)](https://www.npmjs.org/package/stream-connect)
[![npm module downloads per month](http://img.shields.io/npm/dm/stream-connect.svg)](https://www.npmjs.org/package/stream-connect)
[![Build Status](https://travis-ci.org/75lb/stream-connect.svg?branch=master)](https://travis-ci.org/75lb/stream-connect)
[![Dependency Status](https://david-dm.org/75lb/stream-connect.svg)](https://david-dm.org/75lb/stream-connect)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

<a name="module_stream-connect"></a>
## stream-connect
Connect two streams returning a single duplex stream. Use over `.pipe()` when you want to write to the source stream yet read from the destination.

**Example**  
```js
const connect = require('stream-connect')

function streamsOneAndTwo () {
  const streamOne = getStreamOneSomehow()
  const streamTwo = getStreamTwoSomehow()

  // We want to return streams one and two pre-connected. We can't return
  // `streamOne.pipe(streamTwo)` as this returns streamTwo while the calling code
  // wants to write to streamOne yet receive the output from streamTwo.
  // So, return a new stream which is streams one and two connected:
  const streamsOneAndTwo = connect(streamOne(), streamTwo())
}

// main.js is piped through the pre-connected streamOne and streamTwo, then stdout
fs.createReadStream('main.js')
  .pipe(streamsOneAndTwo())
  .pipe(process.stdout)
```
<a name="exp_module_stream-connect--connect"></a>
### connect(one, two) ⇒ <code>[Duplex](https://nodejs.org/api/stream.html#stream_class_stream_duplex)</code> ⏏
Connects two streams together.

**Kind**: Exported function  

| Param | Type | Description |
| --- | --- | --- |
| one | <code>[Duplex](https://nodejs.org/api/stream.html#stream_class_stream_duplex)</code> | source stream |
| two | <code>[Duplex](https://nodejs.org/api/stream.html#stream_class_stream_duplex)</code> | dest stream, to be connected to |


* * *

&copy; 2015 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
