"use strict";
/**
 *
 * reorder the columns of the candidates according to the given region
 *
 * also adds a new property to the candidates to signal original order
 *
 * input:
 *   region: [ ... inColumns ],
 *   cand:   [ ... inColumns ]
 *
 *
 * output:
 * [ ... outColumns ]
 *
 * inColumn
 * {
 *    "concept":    String,
 *    "minValue":   Number || null,
 *    "maxValue":   Number || null,
 *    "isMeas":     Boolean,
 *    "colEnums":   Array[String] || null
 * }
 *
 * outColumn
 * {
 *    "concept":    String,
 *    "minValue":   Number || null,
 *    "maxValue":   Number || null,
 *    "isMeas":     Boolean,
 *    "colEnums":   Array[String] || null,
 *    "order":      Number
 * }
 *
 */
define( [], function(){

  return function reorderCandidate( region, cand ) {

    // add all columns present in region and candidate
    const newCand = []
    for( let i=0; i<region.length; i++ ) {

      // find a matching column in the candidate, if existing
      const index = cand.findIndex( ( el ) => {
        return el.concept == region[i].concept;
      });

      if( index < 0 ) {

        // nothing found
        newCand.push( null );

      } else {

        // add correct column
        newCand.push( cand[ index ] );

      }

    }

    // third: add remaining columns
    for( let i=0; i<cand.length; i++ ) {

      // skip empty values
      if( !(cand[i] instanceof Object) ) {
        continue;
      }

      // find a matching column in the candidate, if existing
      let index = newCand.indexOf( cand[i] );

      // only add, if not yet present
      if( index < 0 ) {
        newCand.push( cand[i] );
      }

    }

    // return now ordered candidate
    return newCand;

  }

});