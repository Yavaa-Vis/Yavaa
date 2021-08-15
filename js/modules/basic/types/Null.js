"use strict"
/**
 * defines a null placeholder object for use within the datasets
 * this way, one can use all the usual functions from the other types and do not have to worry about null values
 */
define( [], function(){

  // there is only one Null object
  const instance    = new Null();

  function Null(){

    // return the cached Null object, if not called in constructor mode
    if( !new.target ) {
      return instance;
    }

  }

  /*
   * null is always before any other value
   */
  Null.prototype.compare = function compare(){
    return -1;
  };


  /**
   * Null values should show up empty
   */
  Null.prototype.toString = function toString(){
    return '';
  };

  Null.prototype.toJSON = function toJSON(){
    return null;
  }

  /**
   * to recognize a null value, if need be
   */
  Null.prototype.isNull = true;

  /*
   * Hash value is an empty string here
   */
  Null.prototype.hash = function hash(){
    return '';
  }

  return Null;
});