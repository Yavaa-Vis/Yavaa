"use strict";
define( [ 'basic/protocol_server.in',
          'basic/protocol_server.out',
          'store/job',
          'compEngine/validation/validateMessage',
          'basic/error',
          'basic/log', ],
function( MessageDefIn,
          MessageDefOut,
          JobQueue,
          validateMessage,
          Error,
          log ){

  // actual engine
  return function( sendMsgRaw ) {

    // prepare a sendMsg-function
    function sendMsg( msg, source ){

      // convert errors to plain objects first
      if( Error.isError( msg ) ) {
        msg = msg.toJSON();
      }

      // validate the message
      const validMsg = validateMessage( msg, MessageDefOut, (errMsg) => {

        // serialize the first level of the message
        const serMessage = JSON.stringify( msg, (k, v) => {

          // non-objects
          if( !k ) { return v; }

          // object properties
          switch( true ) {
//            case (v instanceof Array):  return [];
//            case (v instanceof Object): return {};
            case (typeof v == 'string'):  if( v.length > 20 ) {
                                            // shorten strings
                                            return v.substring( 0, 20 ) + '...';
                                          } else {
                                            return v;
                                          }
            default:                    return v;
          }

        } );

        // do the logging
        log( [ 'Message validation error',
               'Source:  ' + source,
               'Error:   ' + errMsg,
               'Message: ' + serMessage ], log.LEVEL_WARNING );

      });

      // relay to actual sending
      sendMsgRaw( msg );

    }

    // prepare sendError-function
    function error( msg ) {
      sendMsg( Error( 'compEngine/engine', msg ) );
    }

    // init job queue
    const jobQueue = new JobQueue( sendMsg, sendMsg, sendMsg );

    // Message Handler
    return function Handler( msg ) {

      // validate the message
      const validMsg = validateMessage( msg, MessageDefIn, (errMsg) => error( errMsg ) );
      if( validMsg ){

        // shortcut
        const command = MessageDefIn[ msg.action ];

        // add job to queue
        let jobId;
        switch( msg['action'].toLowerCase() ) {

          case 'dummy': jobId = jobQueue.addJob( msg['params']['module'],
                                                 command['binding']['method'],
                                                 msg['params'] );
                        break;

          // client side error message just need to be logged, but not processed
          case 'error': break;

          default:      jobId = jobQueue.addJob( command['binding']['module'],
                                                 command['binding']['method'],
                                                 msg['params'],
                                                 msg['action'] );

        }

        // return message about enqueued job
        if( jobId ) {
          sendMsg( { 'action': 'queued', '_jobID': jobId }, 'compEngine/engine' );
        }

      }
    };

  };

});