"use strict";
/**
 * retrieve details for a specific TimeType
 *
 * returns:
 * {
 *    [type]: {                   // TimeType URI repeated
 *      type: String/URI,         // URI for the resolved TimeType
 *      pattern: String/RegExp,   // RegExp to parse the TimeType
 *      meanings: Array[String}   // Interpretation for the values resolved by pattern
 *    }
 * }
 */
define([], function(){

  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return function resolveTimeType( ids ) {

      // make sure ids is an array
      if( !(ids instanceof Array) ) {
        ids = [ids];
      }

      return doQuery( 'dataset/timeType', {
                'url': ids.join(' ')
              })
              .then( function( data ){

                // convert results
                var parsed = {};
                for( var i=0; i<data.length; i++ ) {

                  // add general type to result
                  if( !(data[i]['type']['value'] in parsed) ) {
                    parsed[ data[i]['type']['value'] ] = {
                      'type': data[i]['type']['value'],
                      'pattern': data[i]['pattern']['value'],
                      'meanings': []
                    };
                  }

                  // add meaning
                  parsed[ data[i]['type']['value'] ][ 'meanings' ][ data[i]['order']['value'] ]
                      = data[i]['meaning']['value'].substr( data[i]['meaning']['value'].indexOf( '#' ) + 1 );

                }

                // pass on result
                return parsed;
              });
    }

  }


  return createFunction;

});