/*
 * transforms a given dataset into a simple JSON array according to specs
 *
 * param    |   type          |   desc
 * ----------------------------------------------------------------------
 * data_id  | Number          | ID of the dataset in question
 * colNames | *Array[String]  | identifiers for each column; defaults to column number;
 *                              'null' => don't include colum
 *
 */
"use strict";
define( [ 'store/data' ], function( DataStore ){
  return async function( param ) {

    // get dataset
    const data = DataStore.getData( param.data_id );

    // prepare/check column to name mapping
    const mapping = [];
    param.colNames = param.colNames || {};
    for( let col=0; col<data.length; col++ ) {
      if( param.colNames[col] === null ) {
        mapping.push( null );
      } else {
        mapping.push( param.colNames[col] || col );
      }
    }

    // run through data and convert to entries in resultset
    const resultset = [];
    for( let row=0; row<data[0].length; row++ ) {

      // create entry
      const entry = {};

      // add the data
      for( let col=0; col<data.length; col++ ) {
        if( mapping[col] ){
          if( data[col][row] == null ) {
            entry[ mapping[col] ] = null;
          } else {
            entry[ mapping[col] ] = data[col][row].toJSON();
          }

        }
      }

      // save in resultset
      resultset.push( entry );

    }

    // resolve result
    return {
      'action': 'serialize',
      'type': 'JSON.KeyValue',
      'data': resultset
    };

  };
});