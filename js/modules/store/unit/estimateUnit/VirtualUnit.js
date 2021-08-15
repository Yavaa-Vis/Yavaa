"use strict";
/**
 * defines a virtual unit
 * behaves like a usual unit wrt to compounds,
 * but has no single unit attached like basic/types/Unit
 *
 */
define( [ 'basic/types/Unit' ], function( Unit ){

  function VirtualUnit( comp, isScaled ) {

    // make a deep copy of the compounds from the source unit
    this._setVal( '_compounds', comp );

    this._setVal( '_isScaled', !!isScaled );

    // simplify the compounds vector
    this._simplifyCompoundVector( comp );

  }

  /**
   * set a particular key/value pair for this object
   * - not modifiable
   */
  VirtualUnit.prototype._setVal = function( name, val ) {
    Object.defineProperty( this, name, {
      'value': val
    });
  };

  /**
   * serialize this VirtualUnit for inspection on the debug console
   */
  VirtualUnit.prototype.toJSON = function toJSON(){
    return {
      n: this._compounds.num,
      d: this._compounds.denom,
      f: this._compounds.prefixFactor
    }
  }
  const Util = require( 'util' );
  VirtualUnit.prototype[ Util.inspect.custom ] = VirtualUnit.prototype.toJSON;


  /**
   * get a hash value for this VirtualUnit
   */
  VirtualUnit.prototype.getHash = function getHash(){
    return this.getCompoundHash();
  }

  /**
   * does this VirtualUnit contain compounds that use scales?
   */
  VirtualUnit.prototype.isScaled = function isScaled(){
    return this._isScaled;
  }

  /*
   * simple label for this virtual unit
   */
  VirtualUnit.prototype.getLabel = function getLabel(){
    const out = [];

    // prefix factor
    if( this._compounds.prefixFactor.toString() != "1" ) {
      out.push( this._compounds.prefixFactor.toString(), ' * ' );
    }

    // numerator
    if( this._compounds.num.length > 0 ) {
      out.push( '(' );
      out.push( this._compounds.num.map( (u) => u.getLabel() ).join( ' * ') )
      out.push( ')' );
    } else {
      out.push( 1 );
    }

    // denominator
    if( this._compounds.denom.length > 0 ) {
      out.push( ' / (' );
      out.push( this._compounds.denom.map( (u) => u.getLabel() ).join( ' * ') )
      out.push( ')' );
    }

    return out.join( '' );
  }

  /* XXXXXXXXXXXXXXX Copied Functions from basic/types/Unit XXXXXXXXXXXXXXXX */

  VirtualUnit.prototype.hasEqualCompounds       = Unit.prototype.hasEqualCompounds;
  VirtualUnit.prototype.getCompoundHash         = Unit.prototype.getCompoundHash;
  VirtualUnit.prototype._simplifyCompoundVector = Unit.prototype._simplifyCompoundVector;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXX Factory Functions XXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * copy the compound vector of the given unit
   */
  VirtualUnit.copy = function copy( unit ){
    return new VirtualUnit({
      num:          unit._compounds.num.slice(0),
      denom:        unit._compounds.denom.slice(0),
      prefixFactor: unit._compounds.prefixFactor
    }, unit.isScaled() );
  }


  /**
   * add the compound vectors of two units
   */
  VirtualUnit.mul = function mul( unit1, unit2 ) {

    // handle constants ( == undefined units )
    if( !unit1 ) {
      return unit2; // even it is undefined ...
    }
    if( !unit2 ) {
      return unit1;
    }

    // copy values from unit1
    const nom   = unit1._compounds.num.slice( 0 ),
          denom = unit1._compounds.denom.slice( 0 );

    // add values from unit2 to respective minators (== multiplying)
    nom.push.apply( nom, unit2._compounds.num );
    denom.push.apply( denom, unit2._compounds.denom );

    // multiply the prefixfactors
    const factor = unit1._compounds.prefixFactor.clone().mul( unit2._compounds.prefixFactor );

    // create new virtual unit
    return new VirtualUnit({
      num:    nom,
      denom:  denom,
      prefixFactor: factor
    }, unit1.isScaled() || unit2.isScaled() );

  }

  /**
   * sub the compound vectors of two units
   */
  VirtualUnit.div = function div( unit1, unit2 ) {

    // handle constants ( == undefined units )
    if( !unit1 ) {
      return unit2; // even it is undefined ...
    }
    if( !unit2 ) {
      return unit1;
    }

    // copy values from unit1
    const num   = unit1._compounds.num.slice( 0 ),
          denom = unit1._compounds.denom.slice( 0 );

    // add values from unit2 to respective minators (== division)
    num.push.apply( num, unit2._compounds.denom );
    denom.push.apply( denom, unit2._compounds.num );

    // multiply the prefix-factors
    const factor = unit1._compounds.prefixFactor.clone().div( unit2._compounds.prefixFactor );

    // create new virtual unit
    return new VirtualUnit({
      num:          num,
      denom:        denom,
      prefixFactor: factor
    }, unit1.isScaled() || unit2.isScaled() );

  }

  return VirtualUnit;
});