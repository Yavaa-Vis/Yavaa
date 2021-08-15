"use strict";
/**
 * Wrapper for unit of measurements
 *
 * valid meta data structure:
 * {
 *  label:        'String'          // label
 *  concept:      'String'          // concept of the column
 *  symbol:       'String'          // symbol used for this unit
 *  dimension:    'String'          // dimension of the unit
 *  dimVector:    'Array[number]'   // dimension vector for this unit
 * }
 */
define( [ 'shared/types/Unit' ],
function(     Unit            ){

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Accessors XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return the associated dimension
   */
  Unit.prototype.getSymbol = function getSymbol() {
    return this._symbol;
  }

  /**
   * return the associated dimension
   */
  Unit.prototype.getDimension = function getDimension() {
    if( !this.isPopulated() ) {
      throw Error( 'Function can only be used with populated units!' )
    }
    return this._dimension;
  }

  /**
   * return the associated dimension vector
   */
  Unit.prototype.getDimVector = function getDimVector() {
    if( !this.isPopulated() ) {
      throw Error( 'Function can only be used with populated units!' )
    }
    return this._dimVector.slice( 0 );
  }


  /**
   * has this unit already been populated?
   */
  Unit.prototype.isPopulated = function isPopulated(){
    return ('_label' in this);
  }

  /**
   * is this unit based on a scale (conversion offset != 0)
   */
  Unit.prototype.isScaled = function isScaled(){
    return this._isScaled;
  }

  /**
   * stringify
   */
  Unit.prototype.toString = function toString() {
    return '[Unit: ' + this._uri + ']';
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXX hashes XXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return the hash value as set by UnitStore
   */
  Unit.prototype.getHash = function getHash(){
    return this._hash;
  }

  /**
   * return a hash for all the compound elements
   */
  Unit.prototype.getCompoundHash = function getCompoundHash(){

    // units has to initialized with compounds
    if( !('_compounds' in this) ) {
      throw new Error( 'Compounds not initialised!' );
    }

    // compute hash
    var hash = [ '-', this._compounds.prefixFactor ];
    for( var i=0; i<this._compounds.num.length; i++ ) {
      hash.push( '#' + this._compounds.num[i].getHash() );
    }
    hash.push( '|' );
    for( var i=0; i<this._compounds.denom.length; i++ ) {
      hash.push( '#' + this._compounds.denom[i].getHash() );
    }
    hash.push( '-' );

    return hash.join('');

  }

  /* XXXXXXXXXXXXXXXXXXXXXX _simplyfyCompoundVector() XXXXXXXXXXXXXXXXXXXXXX */

  /**
   * simplify the compound vector by removing common entries
   */
  Unit.prototype._simplifyCompoundVector = function _simplyfyCompoundVector() {

    // no compounds to simplify
    if( !('_compounds' in this) ) {
      return;
    }

    // shortcuts
    const num   = this._compounds.num,
          denom = this._compounds.denom;

    // sort
    num.sort( sortUnits );
    denom.sort( sortUnits );

    // run through both and remove common entries
    let numInd = 0,
        denomInd = 0,
        comp;
    while( (numInd < num.length) && (denomInd < denom.length) ) {

      // compare both compound-units
      comp = sortUnits( num[ numInd ], denom[ denomInd ] );

      // if units are equal, remove both entries
      if( comp == 0 ) {
        num.splice( numInd, 1 );
        denom.splice( denomInd, 1 );
        continue;
      }

      // increase the index of the "smaller" unit
      if( comp < 0 ) {
        numInd += 1;
      } else {
        denomInd += 1;
      }

    }

    // if there are no compounds left, add "one" in the numerator
    if( (num.length == 0) && (denom.length == 0) ) {
      const one = this._store.getUnit( 'http://yavaa.org/ns/units/one' );
      num.push( one );
    }

  }


  /**
   * sorting function for unit arrays
   *
   * returns 0  for a==b
   * returns <0 for a<b
   * returns >0 for a>b
   */
  function sortUnits( a, b ) {
    if( a._type != b._type ) {
      return 1;
    } else {
      return a.getHash().localeCompare( b.getHash() );
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXX getConversionBase() XXXXXXXXXXXXXXXXXXXXXXXXX */

  Unit.prototype.getConversionBase = function getConversionBase(){
    return this._convBase || null;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXX hasEqualCompounds() XXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * compares the compounds of the current node with that of the given one
   */
  Unit.prototype.hasEqualCompounds = function hasEqualCompounds( unit ) {

    // both units have to initialized with compounds
    if( !('_compounds' in this) || !('_compounds' in unit)) {
      throw new Error( 'Compounds not initialised!' );
    }

    // shortcuts
    var c1 = this._compounds,
        c2 = unit._compounds;

    // comp prefix factors
    if( c1.prefixFactor != c2.prefixFactor ) {
      return false;
    }

    // comp minator lengths
    if( c1.num.length !== c2.num.length ) {
      return false;
    }
    if( c1.denom.length !== c2.denom.length ) {
      return false;
    }

    // comp minator contents
    for( var i=0; i<c1.num.length; i++ ) {
      if( c1.num[i] !== c2.num[i] ) {
        return false;
      }
    }
    for( var i=0; i<c1.denom.length; i++ ) {
      if( c1.denom[i] !== c2.denom[i] ) {
        return false;
      }
    }

    // if we came this far, they are equal
    return true;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXX Interaction methods XXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * is this unit compatible to the given other unit
   * == do they share the same dimension
   */
  Unit.prototype.isCompatible = function isCompatible( other ) {

    // check, if both units have been populated
    if( !this.isPopulated() || !other.isPopulated() ) {
      throw new Error( 'Unit is not populated!' );
    }

    // check for mismatches in the dimension vectors
    for( var i=0; i<this._dimVector.length; i++ ) {
      if( this['_dimVector'][i] != other['_dimVector'][i] ) {
        return false;
      }
    }

    // if we came this far, the dimension vectors are identical
    return true;

  }


  /**
   * return a list of other prefixed versions of this unit
   * @returns {Promise}
   */
  Unit.prototype.getOtherPrefixes = function getOtherPrefixes(){

    // check, if both units have been populated
    if( !this.isPopulated() ) {
      throw new Error( 'Unit is not populated!' );
    }

    // relay
    return this._store.getOtherPrefixes( this );

  }

  /* XXXXXXXXXXXXXXXXXXCXXXXXXXXXXX inspect() XXXXXXXXXXXXCXXXXXXXXXXXXXXXXXX */

  /**
   * add inspection function on server side
   */
  const Util = require( 'util' );
  Unit.prototype[ Util.inspect.custom ] = Unit.prototype.toJSON;


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX populate() XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * populate the given Unit with
   * - label
   * - dimension
   * - symbol
   */
  Unit.prototype.populate = async function populate(){
    const units = await this._store.populateUnits( [ this ] );
    return units[0];
  }

  // export
  return Unit;

});