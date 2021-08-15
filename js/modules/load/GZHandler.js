/**
 * Just a splitting between server and browser
 */
"use strict";
define( [ requirejs.isBrowser ? 'load/GZHandler.browser' : 'load/GZHandler.server' ], 
function( GZHandler ){
  return GZHandler;
});