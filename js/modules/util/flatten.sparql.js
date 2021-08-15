"use strict";
/**
 * convert a JSON response from the SPARQL endpoint to a flat JS object
 */
define( [], function(){

  return function flattenResult( d ) {

    var res = [];

    for( var i=0; i<d.length; i++ ) {

      var keys = Object.keys( d[i] ),
          obj = {}

      for( var j=0; j<keys.length; j++ ) {

        // convert types, if given
        switch( d[i][ keys[j] ]['datatype'] ) {

          // boolean
          case 'http://www.w3.org/2001/XMLSchema#boolean':
            obj[ keys[j] ] = d[ i ][ keys[j] ]['value'] == 'true';
            break;

          // number
          case 'http://www.w3.org/2001/XMLSchema#integer':
            obj[ keys[j] ] = parseInt( d[ i ][ keys[j] ]['value'], 10 );
            break;

          // decimal
          case 'http://www.w3.org/2001/XMLSchema#decimal':
            obj[ keys[j] ] = parseFloat( d[ i ][ keys[j] ]['value'] );
            break;

          // decimal
          case 'http://www.w3.org/2001/XMLSchema#dateTime':
            obj[ keys[j] ] = new Date( d[ i ][ keys[j] ]['value'] );
            break;

          // nothing found
          default:
            obj[ keys[j] ] = d[ i ][ keys[j] ]['value'];
        }

      }

      res.push( obj );

    }

    return res;
  };

})