"use strict";
define( [
  'ui/basic/Yavaa.global',
  'basic/error',
  'ui/basic/logger',
  'ui/broker/comm/onDisconnect',
  'util/requirePromise'
],
function( Y,
          error,
          log,
          onDisconnect,
          requireP
){

  /*
   * manage the communication to the execution engine
   */

  return async function(){

    /**
     * @constructor
     */
    const CommBroker = {};

    /* XXXXXXXXXXXXXXXXXXXXXXXCXXXXXCCXXXXXXXXX SETUP XXXXXXXXXXXXXCCCXXXXXXXXXXXXXXXXXXXXXXX */

    // WebWorker based or Server based?
    const webworker = window.location.hash.indexOf( 'web' ) >= 0;

    // load the engine
    const Engine = await requireP( webworker ? 'client/WorkerComm.web' : 'client/WorkerComm.socket' );

    // create engine
    const engine = webworker
                    ? new Engine( './js/Worker_web.js' ) // WebWorker
                    : new Engine( window.location.origin ); // SocketIO

    // hook up message callback
    engine.addEventListener( 'message', receiveMessage );

    // error callback
    engine.addEventListener( 'error',   receiveError );

    // callback for disconnection
    engine.addEventListener( 'disconnect', onDisconnect );

    // set ready flag
    let engineReady = false;


    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX receiveMessage XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // mapping between jobIds and respective result objects
    const jobMap = {};

    /**
     * handler for receiving messages from engine
     * @param msg   {*}   the message received
     */
    function receiveMessage( msg ) {

      // log
      log( msg, false );

      // react
      switch( msg['action'] ) {

        case 'progress':                            /* XXXXXXX action: progress               */
              // progress is ignored as native promises don't support it (yet)
        case undefined: break;

        case 'ready':                              /* XXXXXXX action: ready                   */

          // show the session ID (used in eval)
          Y.UIBroker.setSessionId( msg['params']['id'] );

          // say we are ready
          engineReady = true;

          break;

        case 'queued':                              /* XXXXXXX action: queued                 */

          // insert to job-map
          jobMap[ msg['_jobID'] ] = commandQueueBlock;

          // reset blocking
          commandQueueBlock = null;

          // try to send next command
          doExecute();

          break;

        case 'error':                               /* XXXXXXX action: error                  */

          // show in dialog
          Y.UIBroker.dialog( 'showError', {
            'error': msg['params']
          });

          // create error object
          const err = error.parseError( msg.params );

          if( !('_jobID' in msg) ) {

            if( commandQueueBlock ) {

              // reject the result
              commandQueueBlock.r.reject( err );

              // reset blocking
              commandQueueBlock = null;

            }

          } else {

            // get respective result object
            const res = jobMap[ msg['_jobID'] ];

            // reject the respective job
            res.r.reject( err );

          }

          break;

        default:                                    /* XXXXXXX action: *                      */

          // get respective result object
          const command = jobMap[ msg['_jobID'] ];

          // pass result on
          command.r.resolve( msg );

          // clear result object
          delete jobMap[ msg['_jobID'] ];

      }

    }


    /**
     * handle errors received from the worker
     * these are NOT custom issued errors
     * @param e
     * @returns
     */
    function receiveError( e ) {

      // show in dialog
      Y.UIBroker.dialog( 'showError', {
        'error': e
      });

    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX sendMessage XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    /**
     * send a message through the communication channel
     * @param   msg   {Object}    message to send
     */
    function sendMessage( msg ) {

      // log to app console
      if( !error.isError( msg ) ){
        log( msg, true );
      }

      // serialize errors, if needed
      if( error.isError( msg ) ) {
        msg = msg.toJSON();
      }

      // send message
      engine.send( msg );

    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX execCommand XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // while waiting for the "queued" event, we can't send a new command
    let commandQueueBlock = null;

    // further queued up commands
    const commandQueue = [];

    /**
     * execute a particular command by inserting it into the command queue
     */
    CommBroker.execCommand = function( command ) {

      return new Promise( (resolve, reject) => {

        // add to commandQueue
        commandQueue.push({
          c: command,
          r: { resolve, reject }
        });

        // trigger execution
        setTimeout( doExecute, 0 );

      });

    };


    /**
     * execute a command from the queue
     */
    function doExecute() {

      // if there is nothing to execute or the channel is blocked, just stop
      if( commandQueueBlock || (commandQueue.length < 1) ) {
        return;
      }

      // get item
      commandQueueBlock = commandQueue.shift();

      // send message
      sendMessage( commandQueueBlock.c );

    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX isReady XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    /**
     * submit a single custom basic/error object for logging on server side
     */
    CommBroker.logError = function( err ){
      sendMessage( err )
    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX isReady XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    CommBroker.isReady = function(){
      return engineReady;
    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX EXPORT XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // attach to global object
    Y.CommBroker = CommBroker;

  }

});