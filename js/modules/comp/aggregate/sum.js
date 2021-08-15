"use strict";
/*
 * aggregate function to sum up a collection of numeric values
 */
define( ['basic/types/Null','basic/types/ArbNumber'], function( Null, ArbNumber ){

  return function sum( values ){

    // no value => null
    if( values.length < 1 ) {
      return new Null();
    }

    // calculate sum
    var res = new ArbNumber( '0' );
    for( var i=0; i<values.length; i++ ) {
      if( values[i] instanceof ArbNumber ) {
        res.add( values[i] );
      }
    }

    // return sum
    return res;
  }

});