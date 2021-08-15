"use strict";
define( ['socketio'], function( io ){

  /**
   * Create a new Worker and set up the respective connection
   * @constructor
   */
  function Connection( socketUrl ) {

    // save worker link
    this._worker = io.connect( socketUrl, {
      'connect timeout': 5000,
      'path':            window.location.pathname + 'ws'
    });

    // init callback stacks
    this._cb = {};

    // set up worker callbacks
    this._worker.on( 'worker', ( message ) => {

      // just process message, if we really have some callbacks
      if( 'message' in this._cb ) {

        // extract message and parse it
        const msg = JSON.parse( message );

        // fire all callbacks
        for( let i=0; i<this._cb['message'].length; i++ ) {
          try {
            this._cb['message'][i]( msg );
          } catch( err ) {
            handleError( err );
          }

        }

      }

    });

    // handler for disconnection/close
    const disconn = ( e ) => {
      // fire all callbacks
      for( let i=0; i<this._cb['disconnect'].length; i++ ) {
        try {
          this._cb['disconnect'][i]( e );
        } catch( err ) {
          handleError( err );
        }

      }
    };

    // error handler
    const handleError = (e) => {

      // sometimes we may get a string here, so make it a valid error
      if( typeof e == 'string' ) {
        e = new Error( e );
      }

      // relay to error handlers, if present
      if( 'error' in this._cb ) {

        // fire all callbacks
        this._cb['error']
            .forEach( cb => cb( e ) );

      }

    };

    // listen for disconnection event
    this._worker.on( 'disconnect', disconn );
    this._worker.on( 'close', disconn );

    // error callback
    this._worker.on( 'error', handleError );


  }

  /**
   * send a message to the engine
   * @param msg
   */
  Connection.prototype.send = function( msg ) {

    this._worker.emit( 'worker', msg );

  };

  /**
   * set callback handlers for the engine's events
   * @param event
   * @param callback
   */
  Connection.prototype.addEventListener = function( event, callback ) {
    // possible events:
    // - error
    // - message

    // make sure event is all lower case and a string
    event = ('' + event).toLowerCase();

    // make sure there is a stack present
    this._cb[ event ] = this._cb[ event ] || [];

    // add to respective stack
    this._cb[ event ].push( callback );

  };

  /**
   * Terminate the worker
   */
  Connection.prototype.kill = function() {
    this.send( 'kill' );
    this._worker.close();
  };


  return Connection;

});