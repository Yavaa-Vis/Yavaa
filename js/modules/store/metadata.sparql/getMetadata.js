"use strict";
/**
 * retrieve the dataset metadata from the store
 */
define([ 'util/flatten.sparql' ], function( flatten ){

  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return function getMetadata( ids ) {
      
      // format URIs for request
      let req;
      if( ids instanceof Array ) {
        req = ids.map( (id) => { return { type: 'uri', value: id }; } );
      } else {
        req = [ { type: 'uri', value: ids } ];
      }
      
      return doQuery( 'dataset/metadata', {
                'uri': req
              })
              .then( function( data ) {

                // flatten result
                data = flatten( data );
                
                // group results
                let parsed = {};
                data
                  .forEach( (row) => {
                    
                    // create entry for dataset, if not present
                    parsed[ row.ds ] = parsed[ row.ds ] || {};
                    
                    // init property
                    parsed[ row.ds ][ row.p ] = parsed[ row.ds ][ row.p ] || [];
                    
                    // add property
                    parsed[ row.ds ][ row.p ].push( row.o );
                    
                  })
                  
                // pass on result
                if( ids instanceof Array ) {

                  return parsed;
                  
                } else {
                   
                  // if just one dataset was requested, we have to extract it
                  return parsed[ Object.keys(parsed)[0] ];
                  
                }

              });
    }

  }


  return createFunction;

});