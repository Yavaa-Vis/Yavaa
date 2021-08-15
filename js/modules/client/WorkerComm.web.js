"use strict";
define( function(){

  /**
   * Create a new Worker and set up the respective connection
   * @constructor
   */
  function Connection( workerUrl ) {

    // save worker link
    this._worker = new Worker( workerUrl );

    // init callback stacks
    this._cb = {};

    // set up worker callbacks
    this._worker.addEventListener( 'message', function( message ) {
      // just process message, if we really have some callbacks
      if( 'message' in this._cb ) {

        // extract message and parse it
        var msg = JSON.parse( message.data );

        // fire all callbacks
        for( var i=0; i<this._cb['message'].length; i++ ) {
          this._cb['message'][i]( msg );
        }

      }
    }.bind( this ));

  }

  /**
   * send a message to the engine
   * @param msg
   */
  Connection.prototype.send = function( msg ) {

    this._worker.postMessage( msg );

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
    this._worker.terminate();
  };


  return Connection;

});