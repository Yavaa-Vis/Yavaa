"use strict";
/**
 * augment the given list of columns with the number of enumerations for codelist columns
 *
 * Input Format:
 * [ ... ds : URI ]
 *
 * Output Format:
 * {
 *    dsUri1: dimCount,
 *    dsUri2: dimCount,
 *    ...
 * }
 *
 */
define([    'util/flatten.sparql',
],function( flatten
){

  return async function getDatasetDimCount( doQuery, datasets ){

    // make sure we have an array
    if( !(datasets instanceof Array) ) {
      datasets = [ datasets ];
    }

    // query store
    let data = await doQuery( 'dataset/dimCount',{
                  'ds': datasets.map( (ds) => { return { type: 'uri', value: ds } })
                });

    // flatten result
    data = flatten( data );

    // create lookup for result
    const lookup = {};
    data.forEach( (row) => {
      lookup[ row.ds ] = row.count;
    });

    // done
    return lookup;

  }

});