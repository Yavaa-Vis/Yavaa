"use strict";

// Setup RequireJS
var RequireJS = require( __dirname + '/../lib/requirejs/r' );
require( __dirname + '/modules/config/require' )( RequireJS );

// error handler
RequireJS( ['basic/error'], function( error ){

  // requirejs
  RequireJS.onError = function( err ) {
    sendMsg( error( 'requirejs.js (worker)', err ) );
  };

  // worker
  process.on( 'uncaughtException', function( err ) {
    sendMsg( error( 'compEngine', err ) );
  });

});

// path to log file; will only be set after sessionID is submitted
let logFile, sessionId ;

// init engine
RequireJS( [ 'config/worker', 'compEngine/engine', 'basic/log' ], function( config, engine, log  ){

  // get message handler
  const handler = engine( sendMsg );

  // hookup engine
  process.on( 'message', function( msg ) {

    // intercept session message
    if( msg.action && (msg.action == 'sessionId') ) {

      // get session id
      sessionId = msg.params.id.replace( /[^a-zA-Z0-9]/gi, '' );

      // set logfile, if enabled
      if( config.logToFile ) {

        // formatted timestamp
        const ts = (new Date).toISOString().replace( /[^0-9\-A-Z]/g, '-' );

        // set log file
        logFile = require( 'path' )
                    .join( __dirname, '..', config.logFolder, ts + '_' + sessionId + '.log' );

      }

      // send ready to client
      sendMsg( { action: 'ready', params: { id: sessionId } } );

      return;
    }

    // reset last activity timer
    lastActivity = Date.now();

    // log message to file
    if( logFile ) {

      // include
      const Fs = require('fs');

      // build log entry
      const logEntry = { ts: lastActivity, type: 'in', msg: msg };

      // append to log
      Fs.appendFile( logFile, JSON.stringify( logEntry ) + '\n',
                     (err) => { if (err){ console.log( err ); } } );

    }

    // kill switch
    if( msg == 'kill' ) {
      log( 'process died due to kill-command', log.LEVEL_INFO );
      process.exit();
    }

    // process
    handler( msg );

  });

  // we are ready (sent only to dispatcher)
  sendMsg( 'ready' )

});


// suicide function: after x seconds without activity clear process and thereby memory
var lastActivity;
RequireJS( ['config/worker', 'basic/log' ], function( config, log ){

  setInterval( function(){

    if( lastActivity + config.workerTTL < Date.now() ) {
      log( 'process died due to inactivity', log.LEVEL_INFO );
      process.exit();
    }

  }, config.workerTTL );

});


/**
 * send a message from the worker
 * @param msg the message to send
 */
function sendMsg( msg ) {

  // reset last activity timer
  lastActivity = Date.now();

  // log message to file
  if( logFile ) {

    // include
    const Fs = require('fs');

    // build log entry
    const logEntry = { ts: lastActivity, type: 'out', msg: msg };

    // append to log
    Fs.appendFile( logFile, JSON.stringify( logEntry, jsonStringfier ) + '\n',
                   (err) => { if (err){ console.log( err ); } });

  }

  // relay message
  process.send( JSON.stringify( msg, jsonStringfier ) );

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