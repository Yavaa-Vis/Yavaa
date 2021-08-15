"use strict";
/*
 * takes a unit-like object and replaces all units in the compounds
 * with their respective compounds
 *
 * if a replacement is given, just this will be dealt with
 */
define( [ 'basic/types/ArbNumber' ], function( ArbNumber ){

  // often used ..
  var one = ArbNumber( 1 );

  return function replaceCompounds( unit, replacement ) {

    // shortcuts
    var num     = unit._compounds.num.slice( 0 ),
        denom   = unit._compounds.denom.slice( 0 ),
        factor  = unit._compounds.prefixFactor.clone();

    // find all occurrences in the numerator
    for( var j=num.length-1; j>=0; j-- ) {

      // skip some
      if( replacement && (num[j] != replacement) ) {
        continue;
      }
      if( !('_compounds' in num[j]) ) {
        continue;
      }

      // if there is something to change
      var dep = num[j];

      if(    (dep._compounds.prefixFactor.compare( one ) !== 0)
          || (dep._compounds.num.length > 1)
          || (dep._compounds.denom.length > 0)) {

        // remove dependency
        num.splice( j, 1 );

        // add components of dependency
        num.push.apply( num, dep._compounds.num );
        denom.push.apply( denom, dep._compounds.denom );
        factor = factor.mul( dep._compounds.prefixFactor );
      }

    }


    // find all occurrences in the denominator
    for( var j=denom.length-1; j>=0; j-- ) {

      // skip some
      if( replacement && (denom[j] != replacement) ) {
        continue;
      }
      if( !('_compounds' in denom[j]) ) {
        continue;
      }

      // if there is something to change
      var dep = denom[j];
      if(    (dep._compounds.prefixFactor.compare( one ) !== 0)
          || (dep._compounds.num.length > 1)
          || (dep._compounds.denom.length > 0)) {

        // remove dependency
        denom.splice( j, 1 );

        // add components of dependency
        num.push.apply( num, dep._compounds.denom );
        denom.push.apply( denom, dep._compounds.num );
        factor = factor.div( dep._compounds.prefixFactor );

      }

    }

    // set new compounds
    unit._compounds.num = num;
    unit._compounds.denom = denom;
    unit._compounds.prefixFactor = factor;

    // return the respective unit
    return unit;
  }
})