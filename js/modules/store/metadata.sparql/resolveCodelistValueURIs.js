"use strict";
/**
 * resolve the uris for a given list of labels with respect to a given codelist
 * 
 * parameter:
 * - codelist   ...     Codelist which to resolve to
 * - label      ...     Array of labels to resolve
 */
define([ 'util/flatten.sparql' ], function( flatten ){
  

  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return function resolveCodelistValueURIs( codelist, label ) {

      // make inputs are arrays
      label     = (label instanceof Array)    ? label     : [ label ];
      codelist  = (codelist instanceof Array) ? codelist  : [ codelist ];
      
      // make sure values are unique
      label     = [ ... new Set( label ) ];
      codelist  = [ ... new Set( codelist ) ];

      // prepare for query
      label     = label.map(    (l)  => { return { type: 'string', value: l } } );
      codelist  = codelist.map( (cl) => { return { type: 'uri',    value: cl } } );

      // run query
      return doQuery( 'dataset/codelist_label2uri', {
                'label': label,
                'codelist': codelist
              })
              .then( function( data, result ) {

                // flatten data
                data = flatten( data );
                
                // parse into result object
                var pData = {};
                for( var i=0; i<data.length; i++ ) {

                  pData[ data[i].label ] = data[i].uri;

                }

                // pass on result
                return pData;

              });
    }

  }

  return createFunction;

});