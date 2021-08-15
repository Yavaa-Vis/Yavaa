"use strict";
/*
 * given a remainder after applying a candidate to the region, this will return all subregions,
 * that still have to be searched for
 *
 * input:
 *    region:      [ ... columns ]
 *    remainder:   [ ... [ ... columns ] ]
 *
 * output:
 * [
 *   ... [ ... columns ]
 * ]
 *
 * column
 * {
 *    "concept":    String,
 *    "minValue":   Number || null,
 *    "maxValue":   Number || null,
 *    "isMeas":     Boolean,
 *    "colEnums":   Array[String] || null,
 *    "order":      Number                    // just for candidates
 * }
 *
 */
define( [], function(){

  return function createSubregions( region, remainder, dataset ) {

    // create options array
    const options = [];
    for( let i=0; i<region.length; i++ ) {

      // column
      let col = [];
      options.push( col );

      // add region column
      col.push( region[i] );

      // add remainder
      col.push.apply( col, remainder[i] );

    }

    // create almost all combinations
    // (skip the first one, which is equal to the original region)
    const result = new Set( combine( options, dataset, 1 ) );

    // return set of all subregions
    return result;

  }


  /**
   * emits all possible combinations of the given base
   * first combination equals the 0 indices of all base entries
   *
   * @param     {Array[Array]}  base      the options array
   * @param     {Array}         dataset   the dataset that was matched
   * @param     {Number}        skip      how many entries to skip at the beginning
   * @returns   {Array}                   new regions
   */
  function* combine( base, dataset, skip ) {

    // set up position array
    const pos = Array( base.length ).fill( 0 );

    // skip some entries
    let overflow;
    for( let i=0; i<skip; i++ ) {
      overflow = increment( base, pos );
    }

    // if there is nothing left, we end here
    if( overflow ) {
      return;
    }

    // create the combinations
    let unbound, col;
    while( true ) {

      // is at least one column unbound?
      // == at least one index in pos is 0
      unbound = pos.some( (el) => el === 0 );

      // create current combination
      let result = [];
      for( let i=0; i<pos.length; i++ ) {

        // get column to add
        if( unbound && (pos[i] != 0) ) {

          // bound column

          // clone column
          col = cloneColumn( base[ i ][ pos[i] ] );
          col.isMeas = false;

        } else {

          // unbound column
          col = base[ i ][ pos[i] ];

        }

        // add to subregion
        result.push( col );

      }
      yield result;

      // increment position array
      overflow = increment( base, pos );

      // if we covered all entries, we are done
      if( overflow ) {
        return;
      }

    }
  }



  /**
   * increment the position array with respect to the options array
   * modifies the position array
   * returns true, if there has been an overflow
   *
   * @param     {Array[Array]}    base    options array
   * @param     {Array[Number]}   pos     position array
   * @returns   Boolean                   overflow
   */
  function increment( base, pos ) {

    let carry = 1,
        index = base.length - 1,
        l;
    while( (carry > 0) && (index >= 0) ) {

      // add to current position
      pos[ index ] += 1;

      // prevent "overflow" and calculate next carry
      l = base[ index ].length;
      carry = pos[ index ] - l + 1;
      pos[index] = pos[index] % l;

      // to the next position
      index -= 1;

    }

    // if there is a carry left, there is an overflow
    return (carry > 0);

  }


  /**
   * clone a column object
   *
   * @param   {Object}      col   the column to clone
   * @returns {Object}            the cloned column
   */
  function cloneColumn( col ) {
    const clone = {};
    for( let key in col ) {

      switch( true ) {

        // dates
        case (col[key] instanceof Date): clone[key] = new Date( col[key] ); break;

        // arrays
        case (col[key] instanceof Array): clone[key] = col[key].slice(0); break;

        // primitive types
        default:  clone[key] = col[key];

      }
    }
    return clone;
  }

});