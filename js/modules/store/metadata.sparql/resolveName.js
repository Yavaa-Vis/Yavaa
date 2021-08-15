"use strict";
/**
 * resolve the labels for a given list of entities
 */
define([], function(){

  // hierarchy of possible label properties
  const labelProps = [ 'label', 'title', 'prefLabel', 'uri' ];

  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return function resolveName( ids ) {

      // make sure ids is an array
      if( !(ids instanceof Array) ) {
        ids = [ ids ];
      }

      // no entries to resolve, so we ca just return an empty result
      if( ids.length < 1 ) {
        return Promise.resolve( {} );
      }

      // prepare uris
      var uris = ids.map( (uri) => { return { type: 'uri', value: uri } } );

      // run query
      return doQuery( 'resolveName', {
                'uris': uris
              })
              .then( function( data, result ) {

                // parse all data
                var pData = {};
                for( var i=0; i<data.length; i++ ) {

                  // get label property
                  var src = labelProps.find( (prop) => prop in data[i] );

                  // get value
                  pData[ data[i]['uri']['value'] ] = data[i][ src ]['value'];

                }

                // pass on result
                return pData;

              });
    }

  }


  return createFunction;

});