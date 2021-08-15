"use strict";
/**
 * create an actual function out of the output of comp/function/parseFormula
 */
define( [ 'basic/types/ArbNumber' ], function( ArbNumber ){

  return function createFunction( funktionData ) {

    // build function
    var funktion = new Function( 'values,constants,funktions', '"use strict"; ' + funktionData['funktion'] + ';' );

    // build constants
    var constants = {};
    for( var i=funktionData['constants'].length; i--; ) {
      constants[ funktionData['constants'][i] ] = new ArbNumber( funktionData['constants'][i] );
    }

    // TODO build wrapper for funktions

    // build applicable function
    var appFunktion = function( funktion, constants, funktions ) {

      return function( values ) {
          return funktion( values, constants, funktions );
      };

    }( funktion, constants );


    return appFunktion;

  }

});