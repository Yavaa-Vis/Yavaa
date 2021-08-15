"use strict";
/**
 * try to convert back from a given VirtualUnit to a Unit
 *
 * current approach: brute force
 * - list all compatible units
 * - find the best match
 *
 * return value:
 * - candidates ... list of other possible units; just returned, if we could not do an exact match
 * - unit   ... the resolved unit
 * - factor ... [input unit] / factor = [output unit] <=> value [input unit] = value * factor [output unit]
 * - vunit  ... (optional) could not resolve the given virtual unit
 *
 */
define( [ 'basic/types/ArbNumber',
          'basic/types/Unit'
], function(
          ArbNumber,
          Unit
){

  // cache the number one
  const one = ArbNumber( '1' );

  async function resolveVirtualUnit( vunit ) {

    // if it is already a unit, just return
    if( vunit instanceof Unit ) {
      return { unit: vunit, factor: one };
    }

    // short-circuit cases
    if( vunit._compounds.denom.length == 0 ){

      // only one unit left
      if( vunit._compounds.num.length == 1 ) {

        // we found at least the base unit
        const base = vunit._compounds.num[0];

        // no prefix, so just the unit
        if( vunit._compounds.prefixFactor.compare( one ) == 0 ) {
          return { unit: base, factor: one };
        }

        // else try to find matching prefixes
        return getPrefixed.call( this, base, vunit );

      }

      // no unit left
      if( vunit._compounds.num.length == 0 ) {

        const oneUnit = this.getUnit( 'http://yavaa.org/ns/units/one' );
        await this.populateUnits( oneUnit );

        return {
          unit:   oneUnit,
          factor: one
        };

      }

    }

    // default: compare against the pool of units with the same dimension
    return getOther.call( this, vunit );

  }


  /**
   * get a list of other units with the same dimension and compare the respective compounds
   */
  async function getOther( vunit ) {

    // get all involved units
    const involvedUnits = vunit._compounds.num.concat( vunit._compounds.denom );

    // make sure all units are populated
    await this.populateUnits( involvedUnits );

    // compute resulting dimension vector
    const dimVector = [ 0, 0, 0, 0, 0, 0, 0 ];
    let comp = vunit._compounds.num;
    for( let i=0; i<comp.length; i++ ) {

      // get compound dimension vector and add to current
      const compVector = comp[i].getDimVector();

      // add to current
      for( let j=0; j<compVector.length; j++ ){
        dimVector[ j ] += compVector[j];
      }

    }
    comp = vunit._compounds.denom;
    for( let i=0; i<comp.length; i++ ) {

      // get compound dimension vector
      const compVector = comp[i].getDimVector();

      // sub from current
      for( let j=0; j<compVector.length; j++ ){
        dimVector[ j ] -= compVector[j];
      }

    }

    // get a list of candidates
    const cand = await this.getUnitsByDimVector( dimVector );

    // populate the compounds for all
    await this.populateCompounds( cand );

    // shortcuts
    const targetNum   = vunit._compounds.num,
          targetDenom = vunit._compounds.denom,
          targetFactor = vunit._compounds.prefixFactor;

    // compare
    let bestMatch = null,
        bestMatchFactor = null;
    for( let i=0; i<cand.length; i++ ) {

      // shortcuts II
      const candNum    = cand[i]._compounds.num,
            candDenom  = cand[i]._compounds.denom,
            candFactor = cand[i]._compounds.prefixFactor;

      // compound vectors have to be equal
      if(    !isEqualArray( targetNum, candNum )
          || !isEqualArray( targetDenom, candDenom )) {
        continue;
      }

      // we have an exact match
      if( candFactor.compare( targetFactor ) == 0 ){
        return { unit: cand[i], factor: one };
      }

      // check, if this is smaller than given
      if( (candFactor.compare( targetFactor ) < 0) ) {

        // check, if it is bigger, than current best match
        if( !bestMatch || (bestMatchFactor.compare( candFactor ) < 0) ) {
          bestMatch = cand[i];
          bestMatchFactor = candFactor;

        }

      }
      if( !bestMatch ) {
        bestMatch = cand[i];
        bestMatchFactor = candFactor;
      }

    }

    // did we find anything?
    if( !bestMatch ) {

      // no match found, so just return the list of candidates
      return {
        candidates: cand,
      };

    } else {

      // calc adjustment factor
      const adjust = targetFactor.clone().div( bestMatchFactor );

      // return the best match as well as the candidates
      return {
        candidates: cand,
        best:       bestMatch,
        factor:     adjust
      };

    }

  }

  /**
   * compare the two given arrays
   */
  function isEqualArray( a, b ) {

    // have to have the same length
    if( a.length != b.length ) {
      return false;
    }

    // all elements have to be equal
    for( var i=0; i<a.length; i++ ) {
      if( a[i] != b[i] ) {
        return false;
      }
    }

    // all equal
    return true;
  }


  /**
   * given the base unit, find the best matching prefixed version
   */
  async function getPrefixed( base, vunit ) {

    // load all candidate units
    const cand = await this.getOtherPrefixes( base );

    // add the compounds
    await this.populateCompounds( cand );

    // shortcut to current prefixFactor
    const prefixFactor = vunit._compounds.prefixFactor;

    // no match at all - so we have to adjust the current value by the factor
    // < 2 because the unit itself is listed here as well
    if( cand.length < 2 ) {
      return { unit: base, factor: prefixFactor };
    }

    // compare prefixes
    // take the biggest one, that is smaller then the given factor
    let bestMatch = null,
        bestMatchFactor = null;
    for( let i=0; i<cand.length; i++ ){

      // shortcut
      const candFactor = cand[i]._compounds.prefixFactor;

      // found an exact match
      if( candFactor.compare( prefixFactor ) == 0){
        return { unit: cand[i], factor: one };
      }

      // check, if this is smaller than given
      if( (candFactor.compare( prefixFactor ) < 0) ) {

        // check, if it is bigger, than current best match
        if( !bestMatch || (bestMatchFactor.compare( candFactor ) < 0) ) {
          bestMatch = cand[i];
          bestMatchFactor = candFactor;
        }
      }
    }

    // calc adjustment factor
    const adjust = prefixFactor.clone().div( bestMatchFactor );

    // no exact match, take the "closest" and add the factor
    return { unit: bestMatch, factor: adjust, candidates: cand };

  }

  return resolveVirtualUnit;
});