"use strict";
/**
 * define a reaction, when the connection to the engine got closed/timed out
 */
define([ 
    'ui/basic/Yavaa.global'
  ], function( Y ){
  return function onDisconnect(){

    // show disconnect symbol
    document.querySelector( 'body' ).classList.add( 'yavaa-disconnected' );

    // open dialog
    Y.UIBroker.dialog( 'reload' ); 

  };
});