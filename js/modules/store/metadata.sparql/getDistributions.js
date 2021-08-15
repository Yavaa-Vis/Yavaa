"use strict";
/**
 * retrieve the column descriptions for a dataset
 */
define([], function(){

  // define mappings for naming
  var mappings = {
      'http://www.w3.org/ns/dcat#mediaType': 'type',
      'http://www.w3.org/ns/dcat#downloadURL': 'url'
  };

  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return function getDistributions( id ){
      return doQuery( 'dataset/distribution', {
              'url': id
            })
            .then( function( data, result ){

              // convert results
              var parsed = {}, key;
              for( var i=data.length; i--; ) {

                // get key name (including possible mapping)
                key = mappings[ data[i]['p']['value'] ] || data[i]['p']['value'];

                // init property
                parsed[ data[i]['distr']['value'] ] = parsed[ data[i]['distr']['value'] ] || {};
                parsed[ data[i]['distr']['value'] ][ key ] = parsed[ data[i]['distr']['value'] ][ key ] || [];

                // add value
                parsed[ data[i]['distr']['value'] ][ key ].push( data[i]['o']['value'] );

              }

              // pass on results
              return parsed;

            });
    }
  }


  return createFunction;

});