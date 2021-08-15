"use strict"
/**
 * encapsulate strings to support the same methods as other types
 */
define( [], function(){

  function String( val ){

    if( !new.target ) {

      // make sure we are called in constructor mode
      return new String ( val );

    } else {

      // constructor mode
      this._val = val;

    }

  }

  /*
   * Compare String values
   */
  String.prototype.compare = function compare( other ){
    if( !other || other._type != this._type ) {
      1;
    } else {
      return this._val.localeCompare( other.toString() );
    }
  };


  /**
   * Serialize
   *
   * will return the same (primitive) String
   */
  String.prototype.toString = function toString(){
    return this._val;
  };

  String.prototype.toJSON = function toJSON(){
    return this._val;
  }

  /*
   * hash value equals the string
   */
  String.prototype.hash = function hash(){
    return this._val;
  }

  /**
   * store type
   */
  String.prototype['_type'] = 'String';

  return String;
});