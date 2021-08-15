"use strict";
/**
 * export a given dataset into a dsv file
 *
 * settings
 *
 * name           | type    |   default     | desc
 * ------------------------------------------------------------------------------
 * delimiter      | String  | \t            | separator between two values
 * newline        | String  | \n\r          | separator between two rows
 * header         | Boolean | true          | treat first row as header row?
 *
 */
define( [ 'papaparse' ],
function( Parser ){

  // default settings
  const defSettings = {
      'delimiter':  "\t",
      'newline':    "\r\n",
      'header':     true
  };


  return async function ( ds, settings ) {

    // augment with default settings
    settings = settings || {};
    var keys = Object.keys( defSettings );
    for( var i=0; i<keys.length; i++ ) {
      settings[ keys[i] ] = settings[ keys[i] ] || defSettings[ keys[i] ];
    }

    // unknown dataset
    if( !ds ) {
      throw new Error( 'Unknown dataset' );
    }

    // get the data
    const data = ds.getData(),
          cols = ds.getColumnMeta();

    // prepare serialization
    const dsv = [],
          entry = [],
          entryWrapper = [ entry ];

    // include header?
    if( settings.header ) {

      // get labels
      entry.length = 0;
      for( var i=0; i<cols.length; i++ ) {
        entry.push( cols[i].getLabel() );
      }

      // prepend them
      dsv.push( Parser.unparse( entryWrapper, settings ) );
    }

    // convert to dsv
    for( var row=0; row<data[0].length; row++ ){

      // create row-wise entry
      entry.length = 0;
      for( var col=0; col<data.length; col++ ) {
       entry.push( data[ col ][ row ].toString() );
      }

      // add to result
      dsv.push( Parser.unparse( entryWrapper, settings ) );

    }

    // return result
    return dsv.join( settings.newline );

  };

});