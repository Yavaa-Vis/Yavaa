"use strict";
/*
 * aggregate function to bag all items into one set
 * duplicates will be removed
 *
 */
define( [ 'basic/types/Bag' ], function( Bag ){

  return function bag( values ){
    return new Bag( values, true );
  }

});