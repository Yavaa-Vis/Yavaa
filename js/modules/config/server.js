"use strict";
/*
 * server side configuration
 */


// CommonJS
if (typeof exports === 'object' && typeof module === 'object') {

  module.exports = getSettings();

// RequireJS
} else if ( (typeof define !== 'undefined') ) {

  define( [], getSettings );

} else {

  throw new Error( 'This environment was not anticipated.' );

}

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Settings XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

function getSettings(){

  return {

    // running in production mode?
    isProduction: true,

  };
}