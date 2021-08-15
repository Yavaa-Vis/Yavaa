"use strict";
define( [], function() {

  const ZLib = require( 'zlib' );

  /**
   * constructor
   */
  const GZHandler = function GZHandler() {
    this._gzHandler = ZLib.createGunzip()
  };


  GZHandler.prototype['getContents'] = function() {

    return new Promise( (resolve,reject) => {

      // cache result
      const str = [];

      this._gzHandler.on( 'data', function( chunk ){
        str.push( chunk.toString( 'utf8' ) );
      });

      this._gzHandler.on( 'end', function( chunk ){
        resolve( str.join( '' ) );
      });

      this._gzHandler.on( 'error', function( e ) {
        result.reject( e );
      });

    });

  };

  GZHandler.prototype['pipe'] = function( target ) {

  };

  GZHandler.prototype['getStream'] = function(){
    return this._gzHandler;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Piping Functions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  GZHandler.prototype['write'] = function( chunk ) {
    this._gzHandler.write( chunk );
  };


  GZHandler.prototype['end'] = function( chunk ) {
    this._gzHandler.end();
  };


  GZHandler.prototype['on']  = function( ev, cb ) {
    this._gzHandler.on( ev, cb );
  }


  GZHandler.prototype['removeListener']  = function( ev, cb ) {
    this._gzHandler.removeListener( ev, cb );
  }


  GZHandler.prototype['error'] = function( chunk ) {
    console.log( chunk );
  };

  // return object
  return GZHandler;

});