var fs = require( 'fs' )
var inherits = require( 'util' ).inherits
var Stream = require( 'stream' )

/**
 * BlockWriteStream
 * @param {Object} options
 * @param {String} options.path
 * @param {String} options.flags
 * @return {BlockWriteStream}
 */
function BlockWriteStream( options ) {

  if( !(this instanceof BlockWriteStream) )
    return new BlockWriteStream( options={} )

  Stream.Writable.call( this, options )

  this.fd = null
  this.path = options.path
  this.flags = options.flags || 'w'
  this.bytesWritten = 0
  this.writeCount = 0

}

inherits( BlockWriteStream, Stream.Writable )

// If the GC is exposed, triggers a scanvenge, otherwise noop
var scavenge = typeof gc === 'function' ?
  function() { gc( true ) } :
  function() {}

// If the GC is exposed, triggers a mark & sweep, otherwise noop
var sweep = typeof gc === 'function' ?
  function() { gc() } :
  function() {}

Object.assign( BlockWriteStream.prototype, {

  _open( callback ) {
    fs.open( this.path, this.flags, ( error, fd ) => {
      this.fd = fd
      debug( 'open', error ? error.message : fd )
      if( error ) return callback.call( this, error )
      fs.stat( this.path, ( error, stats ) => {
        debug( 'stat', error ? error.message : stats )
        if( error ) return callback.call( this, error )
        if( callback ) callback.call( this )
      })
    })
  },

  _handleWrite( block, callback ) {
    var self = this
    fs.write( this.fd, block, 0, block.length, null, function( error, bytesWritten ) {
      self.bytesWritten += bytesWritten
      self._scavenge()
      callback( error )
    })
  },

  // If the GC is exposed, force a sweep every 16, and a scavenge every 32 or so writes
  // to keep memory consumption in check (see https://github.com/nodejs/node/issues/6078)
  _scavenge() {
    if( this.writeCount++ % 16 === 0 )
      sweep()
    if( this.writeCount++ % 32 === 0 ) {
      this.writeCount = 0
      scavenge()
    }
  },

  _write( block, _, next ) {
    // TODO: Buffer up to a specified block size
    if( this.fd ) this._handleWrite( block, next )
    else this._open( ( error ) => {
      if( error ) return next( error )
      this._handleWrite( block, next )
    })
  },

})

module.exports = BlockWriteStream
