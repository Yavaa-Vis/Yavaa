"use strict";
/*
 * Keep a set of values
 * not yet aggregated
 */

define( [], function(){

  /* ---------------------------- Common Methods --------------------------- */

  /**
   * @constructor
   * @param {Array} values
   */
  function Bag( values, makeUnique ){

    // make sure we are called in constructor mode
    if( !new.target ) {
      return new Bag( values, makeUnique );
    }

    // if values are a list of bags, get their contents
    if( (values.length > 0) && (values[0] instanceof Bag) ){
      var allVals = [];
      for( var i=0; i<values.length; i++ ) {
        Array.prototype.push.apply( allVals, values[i].getValues() );
      }
      values = allVals;
    }

    // retain just unique entries
    if( makeUnique ) {

      // make value list unique
      var unique = {};
      for( var i=0; i<values.length; i++ ) {
        unique[ values[i].hash() ] = values[i];
      }

      // grab unique values
      var keys = Object.keys( unique ).sort();
      values = [];
      for( var i=0; i<keys.length; i++ ) {
        values.push( unique[ keys[i] ] );
      }

    }

    // store values
    this._values = values;
    this._hash = null;

  }

  /**
   * separator for hash generation
   */
  Bag._hashSeparator = "\n";

  /**
   * compare two Bags
   */
  Bag.prototype.compare = function compare( other ) {

    // if other does not include a _values property, it is Null and always smaller
    if( !('_values' in other) ) {
      return 1;
    }

    // compare by size first
    if( this._values.length != other._values.length ) {

      if( this._values.length < other._values.length ) {
        return -1;
      } else {
        return 1;
      }

    }

    // same length => compare contents
    for( var i=0; i<this._values.length; i++ ) {

      var cmp = this._values[i].compare( other._values[i] );
      if( cmp != 0 ) {
        return cmp;
      }

    }

    // not returned yet, same contents
    return 0;

  }

  /**
   * return a hash value for this bag
   */
  Bag.prototype.hash = function hash(){

    // if we already computed the hash - just return it
    if( this._hash ) {
      return this._hash;
    }

    // else we need to compute it
    var hash = [];
    for( var i=0; i<this._values.length; i++ ) {
      hash.push( this._values[i].hash() );
    }

    // store hash
    this._hash = hash.join( Bag._hashSeparator );

    return this._hash;

  }

  /**
   * convert to plain object
   */
  Bag.prototype.toJSON = function toJSON(){
    var res = [];
    for( var i=0; i<this._values.length; i++ ) {
      res.push( this._values[i].toJSON() );
    }
    return res;
  }

  /**
   * convert to string
   */
  Bag.prototype.toString = function toString(){
    var res = [];
    for( var i=0; i<this._values.length; i++ ) {
      if( !this._values[i].isNull ) {
        res.push( this._values[i].toString() );
      }
    }
    return res.join( ', ' );
  }

  /**
   * declare the type
   */
  Bag.prototype._type = 'Bag';


  /* --------------------------- Specific Methods -------------------------- */

  /**
   * get all the values contained within this bag
   */
  Bag.prototype.getValues = function getValues() {
    return this._values;
  }

  /* -------------------------------- Export ------------------------------- */

  return Bag;

});