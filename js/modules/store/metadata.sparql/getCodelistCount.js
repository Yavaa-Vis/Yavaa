"use strict";
/**
 * augment the given list of columns with the number of enumerations for codelist columns
 *
 * Input Format:
 * [ ... matchingDataset ]
 *
 * Output Format:
 * [ ... matchingDataset ]
 *
 * matchingDataset:
 * {
 *  ds:     URI,
 *  covers: [{
 *    concept:        URI,                            // covered concept
 *    enumCount:      Number || null,                 // number of matched codelist values, if present
 *    minValue:       Number || Date || null,         // minimum value of range covered, if present
 *    maxValue:       Number || Date || null,         // maximum value of range covered, if present
 *    isMeas:         Boolean                         // is the column a measurement?
 *    colEnums:       Array[URI] || null              // list of covered codelist values, if present
 *    totalEnumCount: Number || null                  // number of enumerations for the original column
 *  }, ... ]
 * }
 */
define([ 'util/flatten.sparql',
],function( flatten ){

  return async function getCodelistCount( doQuery, datasets ){

    const data = await doQuery( 'dataset/codelistCount',{
                                'ds': datasets.map( (ds) => { return { type: 'uri', value: ds.ds } })
                              });

    // flatten data
    data = flatten( data );

    // lookup for datasets and columns in input
    let lookup = {};
    datasets
      .forEach( (ds) => {

        lookup[ ds.ds ] = {};
        ds.covers
          .forEach( (col) => {
            lookup[ ds.ds ][ col.concept ] = col;
          });

      })

    // augment with data returned by query
    data.forEach( (row) => {

      if( (row.ds in lookup) && (row.concept in lookup[ row.ds ]) ) {
        lookup[ row.ds ][ row.concept ].totalEnumCount = row.count;
      }

    });

    // return the now augmented dataset
    return datasets;

  }

});