'use strict';
/**
 * dev setup for the backend
 */

// includes
const Readline  = require( 'readline' ),
      Fs        = require( 'fs' ),
      Path      = require( 'path' ),
      Io        = require( 'socket.io-client' ),
      Winston   = require( 'winston' )
      ;


// do the replaying
let socket;
(async function(){
  
  // setup logging
  const logger = Winston.createLogger({
    transports: [
      new Winston.transports.Console({
        format: Winston.format.combine(
          Winston.format.align(),
          Winston.format.timestamp(),
          Winston.format.colorize(),
          Winston.format.printf(info => {
            return `${info.timestamp} [${info.level}] ${info.message}`;
          }),
        ),
      }),
    ],
  });


  // setup Yavaa connection
  socket = Io( 'http://localhost:8080', {
    'connect timeout': 5000,
    'path':            '/ws'
  });
  socket.on( 'disconnect',  ()  => logger.info( 'disconnected' ) );
  socket.on( 'connect',     ()  => logger.info( 'connected' ) );
  socket.on( 'error',       (e) => logger.error( e ) );

  // process messages
  socket.on( 'worker', async (msg) => {

    // decode message
    const curMsg = JSON.parse( msg );
    console.log( curMsg );

    switch( curMsg.action ) {
      
      case 'ready':
        // send message
        socket.emit( 'worker', {
          action: 'getMemory',
          params: {},
        });
        break;
        
      case 'memory':
        closeConnection();
        break;
    }

  });



})().catch( (e) => {
  // show error
  console.error( e );
  closeConnection();
});


/**
 * close the connection to the webserver and all open handles
 */
function closeConnection() {
  // close socket
  socket.close();
  // end everything
  process.exit();
}
