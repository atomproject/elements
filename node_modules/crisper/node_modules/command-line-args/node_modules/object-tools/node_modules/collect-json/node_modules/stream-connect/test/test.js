var test = require('tape')
var streamConnect = require('../')
var PassThrough = require('stream').PassThrough
var fs = require('fs')
var via = require('stream-via')

test('chunk passes through both connected streams', function (t) {
  t.plan(2)
  var pass1 = PassThrough()
  pass1.on('data', function (data) {
    t.strictEqual(data.toString(), 'testing')
  })

  var pass2 = PassThrough()
  pass2.on('data', function (data) {
    t.strictEqual(data.toString(), 'testing')
  })

  var connected = streamConnect(pass1, pass2)
  connected.end('testing')
})

test('chunk processed by both connected streams', function (t) {
  t.plan(3)
  var one = via(function (chunk) {
    t.strictEqual(chunk.toString(), 'test')
    return chunk.toString() + '1'
  })
  var two = via(function (chunk) {
    t.strictEqual(chunk.toString(), 'test1')
    return chunk.toString() + '2'
  })
  var connected = streamConnect(one, two)
  connected.on('readable', function () {
    var chunk = this.read()
    if (chunk) {
      t.strictEqual(chunk.toString(), 'test12')
    }
  })
  connected.end('test')
})

test('pipe', function (t) {
  t.plan(4)
  var pass1 = PassThrough()
  var pass2 = PassThrough()

  pass1
    .on('pipe', function (src) {
      t.pass('"pipe" emitted')
      t.strictEqual(src, inputStream)
    })
    .on('data', function (data) {
      t.strictEqual(data.toString(), 'test\n', 'correct "data" 1')
    })

  pass2
    .on('data', function (data) {
      t.strictEqual(data.toString(), 'test\n', 'correct "data" 2')
    })

  var connected = streamConnect(pass1, pass2)
  var inputStream = fs.createReadStream('test/fixture.txt', 'utf8')
  inputStream.pipe(connected)
})

test('error in first of connected streams passed on', function (t) {
  t.plan(1)
  var brokenError = new Error('broken')
  var one = via(function (chunk) {
    throw brokenError
  })
  var two = new PassThrough()
  two.on('data', function (data) {
    t.fail("shouldn't reach here")
  })
  var connected = streamConnect(one, two)
  connected.on('error', function (err) {
    t.strictEqual(err, brokenError)
  })
  connected.end('test')
})

test('error in second of connected streams passed on', function (t) {
  t.plan(2)
  var brokenError = new Error('broken')
  var one = new PassThrough()
  one.on('data', function (data) {
    t.strictEqual(data.toString(), 'test')
  })
  var two = via(function (chunk) {
    throw brokenError
  })
  var connected = streamConnect(one, two)
  connected.on('error', function (err) {
    t.strictEqual(err, brokenError)
  })
  connected.end('test')
})

test('connected stream emits correct events', function (t) {
  t.plan(4)
  var pass1 = PassThrough()
  var pass2 = PassThrough()

  var connected = streamConnect(pass1, pass2)
  connected
    .on('data', function () {
      t.pass('data called')
    })
    .on('end', function () {
      t.pass('end received')
    })
    .on('finish', function () {
      t.pass('finish received')
    })
  connected.write('one')
  connected.end('two')
})
