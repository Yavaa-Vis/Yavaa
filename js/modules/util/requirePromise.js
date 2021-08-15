"use strict";
/**
 * provide a promisified version of require
 */
define( [], function(){

  return function requirePromise( moduleNames ) {

    // make sure we have an array
    const isArray = (moduleNames instanceof Array );
    if( !isArray ) {
      moduleNames = [ moduleNames ];
    }

    // execute the require
    return new Promise( (fulfill, reject) => {

        requirejs( moduleNames, function( ... modules) {
          if( isArray ) {
            fulfill( modules );
          } else {
            fulfill( modules[0] );
          }
        });

    });

  };

});