"use strict";
/**
 * process the contents of a Eurostat TSV file
 * and return arrays of the contained dataset parsed using the given parsers.
 */
define( [ 'basic/types/Null' ],
function( NullType ) {

  /**
   * process the contents of a Eurostat - TSV file
   * @param {string}  file      the file to be parsed
   * @param {Array}   parser    the parsers for each column
   */
  return async function eurostatParser( file, parser ){

    // prepare data result
    var dataRes = [ ];
    for( var i=0; i<parser.length; i++ ) {
      dataRes.push( [] );
    }

    // split into rows
    const data = file.split( "\n" );

    // split into cells
    for( var i=data.length; i--; ){
      data[i] = data[i].split( "\t" );
    }

    // maintain a shortcut to the headers
    var header = data[0];

    // create lookups
    var lookups = [];
    for( var i=0; i<parser.length; i++ ) {
      lookups.push( {} );
    }

    // parse headers (== last dimension)
    for( var i=1; i<header.length; i++ ) {

      // store header
      header[i] = parser[ parser.length - 2 ]( header[i].trim() );

    }

    // parse dimensions
    var dims = header[ 0 ].split( '\\' );
    dims = dims[0].split(',' ).concat( dims[1].split(',' ) );

    // do we have enough parsers for each column?
    if( (dims.length + 1) != parser.length ) {
      throw new Error( 'Dataset does not match schema!' );
    }

    // get the data
    var dim,
        lastCell = parser.length - 1;   // value column after all parsed columns
    for( var i=1; i<data.length-1; i++ ) {

      // separate the first column
      dim = data[i][0].split( ',' );

      // apply all parsers to values in first column
      for( var k=0; k<dim.length; k++ ) {

        if( !(dim[k] in lookups[k]) ) {

          // first occurrence of this instance, create object
          lookups[k][ dim[k] ] = parser[k]( dim[k] );

        }

        // now we are sure, there is a respective value
        dim[k] = lookups[k][ dim[k] ];

      }


      // run through all cells
      var el;
      for( var j=1; j<data[i].length; j++ ) {

        // fill values for first cells
        for( var k=0; k<dim.length; k++ ) {
          dataRes[k].push( dim[k] );
        }

        // add dimensions from header row
        dataRes[ lastCell - 1 ].push( header[j] );

        // fill values for last cell
        if ( !('' + data[i][j]).startsWith( ':' ) ) {
          el = parser[ lastCell ]( data[i][j] );
        } else {
          el = NullType();
        }
        dataRes[ lastCell ].push( el );

      }
    }

    // return data
    return {
      'data':       dataRes,
      'settings':   {},
      'header':     dims,
      'parser':     parser
    };

  };

});
