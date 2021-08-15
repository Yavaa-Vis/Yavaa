"use strict";
/*
 * compute the xth percentiles of the given array of values
 *
 * following: http://informationandvisualization.de/blog/box-plot
 */
define( [ 'basic/types/ArbNumber' ], function( ArbNumber ){

  // we need a factor of a half on occasion
  const half = ArbNumber( '0.5' );

  /*
   * @param   {Array}   values    input list of values
   * @param   {Number}  number    number of quantiles
   * @returns {Array}             quantiles
   */
  return function getQuantiles( values, number ){

    // get a sorted copy of values
    const sorted = values.slice( 0 )
                         .sort( (a,b) => a.clone().sub(b).valueOf() );

    // calc indices
    const indices = [];
    for( let i=1; i<number; i++ ) {

      // add pos
      indices.push( i * values.length / number )

    }

    // get respective values
    const result = indices.map( (ind) => {
      if( ind % 1 == 0 ) {
        return sorted[ ind ].clone().add( sorted[ ind-1 ] ).mul( half );
      } else {
        ind = Math.floor( ind );
        return sorted[ ind ];
      }
    });

    // add minimum and maximum
    result.unshift( sorted[0] );
    result.push( sorted[ sorted.length - 1 ] );

    // done
    return result;

  };

});