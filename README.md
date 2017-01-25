# BlockWriteStream
[![npm](https://img.shields.io/npm/v/block-write-stream.svg?style=flat-square)](https://npmjs.com/package/block-write-stream)
[![npm license](https://img.shields.io/npm/l/block-write-stream.svg?style=flat-square)](https://npmjs.com/package/block-write-stream)
[![npm downloads](https://img.shields.io/npm/dm/block-write-stream.svg?style=flat-square)](https://npmjs.com/package/block-write-stream)

Garbage Collected block write stream

## Install via [npm](https://npmjs.com)

```sh
$ npm install --save block-write-stream
```

## Usage

If run in a node process with `--expose-gc` enabled, it will trigger GC mark & sweep and scavenge
every couple of writes to avoid the Buffers not being GCed in a timely manner, greatly reducing memory consumption.
For details, see https://github.com/nodejs/node/issues/6078.

```js
var BlockWriteStream = require('block-write-stream')
```

```js
var writeStream = new BlockWriteStream({
  path: '/dev/rdisk2',
  flags: 'w',
})
```
