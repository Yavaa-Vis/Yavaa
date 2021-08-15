"use strict";
/**
 * get a list of values included in the respective codelists
 *
 * Input Format:
 * [ String, ... ]
 *
 * Output Format:
 * {
 *   <codelist>: [ ... values ],
 *   ...
 * }
 */
define([ 'util/flatten.sparql',
],function( flatten ){

  // settings
  const cfg = {
      separator: '|'
  };

  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return async function getCodelistValues( codelists ){

      // format URIs for request
      let req;
      if( codelists instanceof Array ) {
        req = codelists.map( (codelist) => { return { type: 'uri', value: codelist }; } );
      } else {
        req = [ { type: 'uri', value: codelists } ];
      }

      // make codelists unique
      codelists = [ ... new Set( codelists ) ];

      // run query against SPARQL
      let data = await doQuery( 'dataset/codelistValues',{
          'codelist':   req,
          'separator':  cfg.separator
        });


      // flatten data
      data = flatten( data );

      // format result
      let result = {};
      data
        .forEach( (row) => {
          // just entries containing values
          if( row.codelist && row.values ) {
            result[ row.codelist ] = row.values.split( cfg.separator );
          }
        });

      // return the now augmented dataset
      return result;

    }

  }

  return createFunction;

});