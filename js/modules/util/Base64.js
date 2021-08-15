"use strict";
/**
 * provide an environment independent interface to Base64 encoding and decoding
 */
define( [], function(){

  return {

    'encode': function( data ) {

      if( typeof btoa != 'undefined' ) {
        // browser
        return btoa( data );
      } else {
        // NodeJS
        return new Buffer( data ).toString( 'base64' )
      }

    },

    'decode': function( data ) {

      if( typeof atob != 'undefined' ) {
        // browser
        return atob( data );
      } else {
        // NodeJS
        return new Buffer( data, 'base64' ).toString( 'utf8' )
      }

    },
  }

});