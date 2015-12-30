'use strict'
var Duplex = require('stream').Duplex

/**
Connect two streams returning a single duplex stream. Use over `.pipe()` when you want to write to the source stream yet read from the destination.

@module stream-connect
@example
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
*/
module.exports = connect

/**
Connects two streams together.

@param {external:Duplex} - source stream
@param {external:Duplex} - dest stream, to be connected to
@return {external:Duplex}
@alias module:stream-connect
*/
function connect (one, two) {
  one.pipe(two)

  var connected = new Duplex({ objectMode: true })
  connected._write = function (chunk, enc, done) {
    one.write(chunk)
    done()
  }
  connected._read = function () {}
  connected
    .on('finish', function () {
      one.end()
    })
    .on('pipe', function (src) {
      one.emit('pipe', src)
    })

  /* use flowing rather than paused mode, for node 0.10 compatibility. */
  two
    .on('data', function (chunk) {
      connected.push(chunk)
    })
    .on('end', function () {
      connected.push(null)
    })
    .on('error', function (err) {
      connected.emit('error', err)
    })

  one.on('error', function (err) {
    connected.emit('error', err)
  })


  return connected
}

/**
@external Duplex
@see https://nodejs.org/api/stream.html#stream_class_stream_duplex
*/
