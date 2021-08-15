"use strict";
/**
 * given two datasets suggest a possible join condition
 *
 * input:
 * - ds1    ... Dataset object
 * - ds2    ... Dataset object
 *
 * output:
 * - Array[Array[Number]]     ... array to hold the column mappings. each mapping is an array with first element
 *                                the index of the column in ds1 and second element the index in ds2
 *
 */
define( [ 'basic/Constants',
          'util/weightedMatching'
], function(
          Constants,
          weightedMatching
){

  /**
   * matching score for two given columns
   * higher is a better match
   */
  function score( ds1, ds2, col1, col2, uniqueVals1, uniqueVals2 ) {

    // datatypes have to match
    if( col1.getDatatype() != col2.getDatatype() ) {
      return undefined;
    }

    // concepts have to match
    if( col1.getConcept() != col2.getConcept() ) {
      return undefined;
    }

    // we will not augment based on joining to measurement columns
    if( !col2.isDimension() ) {
      return undefined;
    }

    switch( col1.getDatatype() ) {

      // categorical columns
      case Constants.DATATYPE.SEMANTIC:
      case Constants.DATATYPE.STRING:

        // count the overlap
        const uniqueSmaller = uniqueVals1.size < uniqueVals2.size ? uniqueVals1 : uniqueVals2,
              uniqueLarger  = uniqueVals1.size > uniqueVals2.size ? uniqueVals1 : uniqueVals2;
        let overlap = 0;
        uniqueSmaller.forEach( el => overlap += uniqueLarger.has(el) ? 1 : 0 )

        return overlap / uniqueSmaller.size;

      // others
      default: return 1;
    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Wrapper Function XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return async function suggestJoin( ds1, ds2 ) {

    // make sure we have two datasets
    if( !ds1 || !ds2 ) {
      throw new Error( 'suggestJoin: Parameter missing!' );
    }

    // get column sets
    const cols1 = ds1.getColumnMeta(),
          cols2 = ds2.getColumnMeta();

    // make sure unique values are present
    ds1.findDistinctValues();
    ds2.findDistinctValues();

    // collect unique values
    const mapper = col => {
      const dist = col.getDistinctValues();
      if( [ Constants.DATATYPE.SEMANTIC, Constants.DATATYPE.STRING ].includes( col.getDatatype() ) ) {
        // for enumeration columns, replace the list by their string representation (easier to compare)
        return new Set( dist.list.map( e => e.toString() ) );
      } else {
        // all others just use the returned object
        return dist;
      }
    };
    const uniqueVals1 = cols1.map( mapper ),
          uniqueVals2 = cols2.map( mapper );

    // build cost matrix
    const cost = [];
    for( let i=0; i<cols1.length; i++ ) {
      const row = [];
      for( let j=0; j<cols2.length; j++ ) {
        row.push( score( ds1, ds2, cols1[i], cols2[j], uniqueVals1[i], uniqueVals2[j] ) );
      }
      cost.push( row );
    }

    // find the matching
    let result = weightedMatching( cost );

    // remove join conditions, where the second column is a measurement
    // we do not want to join to those
    result = result.filter( (pair) => cols2[ pair[1] ].isDimension() );

    // done
    return result;

  };
});