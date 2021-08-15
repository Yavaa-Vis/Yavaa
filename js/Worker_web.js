"use strict";

// load require.js and respective config
importScripts( '../lib/requirejs/require.js' );
importScripts( './modules/config/require.js' );


// error handler
requirejs( ['basic/error'], function( error ){

  // requirejs
  requirejs.onError = function( err ) {
    sendMsg( error( 'requirejs.js (worker)', err ) );
    return false;
  };

  // worker
  self.onerror = function( msg, file, line ) {
    sendMsg( error( 'compEngine', 'Error in ' + file + ' on line ' + line + ': ' + msg ) );
    return false;
  };

});

// init engine
requirejs( ['compEngine/engine'], function( engine ){

  // get message handler
  const handler =  engine( sendMsg );

  // hookup engine
  self.addEventListener( 'message', function( msg ){
    handler( msg.data );
  });

  // we are ready
  sendMsg( { action: 'ready', params: { id: 'localWorker' } } );

});

/**
 * send a message from the worker
 * @param msg the message to send
 */
function sendMsg( msg ) {

  self.postMessage( JSON.stringify( msg, jsonStringfier ) );

}


/**
 * ensure that certain objects - e.g., Sets - get serialized in a proper way
 */
function jsonStringfier( key, val ) {
  if( val instanceof Set ) {
    return [ ... val ]
  } else {
    return val;
  }
}