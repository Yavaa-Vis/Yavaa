"use strict";
/*
 * aggregate function to bag all items
 * default aggregate function
 */
define( [ 'basic/types/Bag' ], function( Bag ){

  return function bag( values ){
    return new Bag( values, false );
  }

});