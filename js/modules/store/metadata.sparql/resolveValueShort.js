"use strict";
/**
 * find the short notations for given URIs
 *
 * parameter:
 * - uri        ...     Array of uris to resolve
 */
define([ 'util/flatten.sparql' ], function( flatten ){


  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return function resolveValueShort( uris ) {

      // make inputs are arrays
      uris = (uris instanceof Array)     ? uris      : [ uris ];
      uris = uris.filter( (u) => (null !== u) && (typeof u !== 'undefined' ) );

      // no uris, no work
      if( uris.length < 1 ) {
        return Promise.resolve( {} );
      }

      // make sure values are unique
      uris      = [ ... new Set( uris ) ];

      // prepare for query
      uris      = uris.map(     (l)  => { return { type: 'uri', value: l } } );

      // run query
      return doQuery( 'dataset/values_uri2short', {
                'uri':      uris,
              })
              .then( function( data ) {

                // flatten data
                data = flatten( data );

                // parse into result object
                var pData = {};
                for( var i=0; i<data.length; i++ ) {

                  pData[ data[i].uri ] = data[i].short;

                }

                // pass on result
                return pData;

              });
    }

  }

  return createFunction;

});