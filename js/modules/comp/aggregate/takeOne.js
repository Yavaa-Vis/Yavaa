"use strict";
/*
 * aggregate function to take the first value
 */
define( [], function(){

  return function takeFirst( values ){
    return values[ 0 ];
  }

});