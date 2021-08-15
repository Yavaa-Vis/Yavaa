"use strict";
/**
 * compare two given variables, if they share the same content
 * * includes type checks
 */
define([],function(){

  return function deepObjectEqual( a, b, ignoreKeys ){

    // check types
    if( typeof a !== typeof b ) {
      return false;
    }

    // base on types ..

    // null
    if( (a === null) || (b === null) ) {

      if( a === b ) {
        return true;
      } else {
        return false;
      }
    }

    // array
    if( Array.isArray( a ) && Array.isArray( b ) ) {
      // for an array all elements should be the same

      // check the array lengths
      if( a.length != b.length ) {
        return false;
      }

      // check elements
      for( var i=0; i<a.length; i++ ) {
        if( !deepObjectEqual( a[i], b[i] ) ) {
          return false;
        }
      }

      // found no difference
      return true;
    }

    // object
    if( typeof a == 'object' ) {
      // should share the same keys and the same content per key

      // init ignoreKeys, if not set
      ignoreKeys = ignoreKeys || [];
      
      // check keysets
      var keysA = Object.keys( a ).filter( (key) => !ignoreKeys.includes( key ) ).sort(),
          keysB = Object.keys( b ).filter( (key) => !ignoreKeys.includes( key ) ).sort();
      if( !deepObjectEqual( keysA, keysB ) ) {

        return false;
      }

      // check key contents
      for( var i=0; i<keysA.length; i++ ) {
        
        // ignore some keys
        if( ignoreKeys.includes( keysA[i] ) ) {
          continue;
        }
        
        // recursive call
        if(!deepObjectEqual( a[ keysA[i] ], b[ keysA[i] ], ignoreKeys ) ){
          return false;
        }
      }

      // found no difference
      return true;
    }

    // default case should only be simple types, thus compare directly
    return a === b;

  };

});