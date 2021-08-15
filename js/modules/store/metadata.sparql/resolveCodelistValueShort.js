"use strict";
/**
 * given a certain codelist, find the short notations for given URIs
 *
 * parameter:
 * - codelist   ...     Codelist which to resolve to
 * - uri        ...     Array of uris to resolve
 */
define([ 'util/flatten.sparql' ], function( flatten ){


  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return function resolveCodelistValueShort( codelist, uris ) {

      // make inputs are arrays
      uris      = (uris instanceof Array)     ? uris      : [ uris ];
      codelist  = (codelist instanceof Array) ? codelist  : [ codelist ];

      // make sure values are unique
      uris      = [ ... new Set( uris ) ];
      codelist  = [ ... new Set( codelist ) ];

      // prepare for query
      uris      = uris.map(     (l)  => { return { type: 'uri', value: l } } );
      codelist  = codelist.map( (cl) => { return { type: 'uri', value: cl } } );

      // run query
      return doQuery( 'dataset/codelist_uri2short', {
                'uri':      uris,
                'codelist': codelist
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