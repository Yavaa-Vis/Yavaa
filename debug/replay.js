'use strict';
/**
 * rerun a given logfile on a Yavaa connection
 */

// includes
const Readline  = require( 'readline' ),
      Fs        = require( 'fs' ),
      Path      = require( 'path' ),
      Io        = require( 'socket.io-client' ),
      Winston   = require( 'winston' )
      ;

// configuration
const cfg = {

  // the logfile to replay
  log:    Path.join( __dirname, 'log', '2020-07-27T14-24-42-825Z_LZCxhSdmHeXmwPaoAfzR.purged.log' ),

};


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

  // init logfile access
  const logfileInterface = Readline.createInterface({
    input: Fs.createReadStream( cfg.log ),
  });
  const logfile = logfileInterface[Symbol.asyncIterator]();

  // setup Yavaa connection
  socket = Io( 'http://localhost:8080', {
    'connect timeout': 5000,
    'path':            '/ws'
  });
  socket.on( 'disconnect',  ()  => logger.info( 'disconnected' ) );
  socket.on( 'connect',     ()  => logger.info( 'connected' ) );
  socket.on( 'error',       (e) => logger.error( e ) );

  // process messages
  logger.info( `replaying ${Path.basename( cfg.log )}` );
  let nextMsg   = JSON.parse( (await logfile.next()).value ),
      msgNumber = 1;
  socket.on( 'worker', async (msg) => {

    // decode message
    const curMsg = JSON.parse( msg );
    
    // compare the current message against, what we expect
    if( nextMsg.msg.action == curMsg.action ) {
      logger.info( logMsg( 'out', msgNumber, msg, nextMsg.msg) );
      if( curMsg.action == 'error' ) {
        logger.error( logErrorMsg( msgNumber, curMsg ) );
      }
    } else {
      logger.error( `(${msgNumber}) expected [${nextMsg.msg.action}] got [${curMsg.action}]` );
      return closeConnection();
    }

    // get next message
    do {

      // get next line from logfile
      const nextLine = await logfile.next();
      
      // end if empty line
      if( !nextLine.value || (nextLine.value.trim() == '') ) {
        logger.info( 'done' );
        return closeConnection();;
      }

      // grab next message
      nextMsg   = JSON.parse( nextLine.value );
      msgNumber += 1;

      // send next message, if outgoing
      if( nextMsg.type == 'in' ) {
        logger.info( logMsg( 'in', msgNumber, null, nextMsg.msg) )
        socket.emit( 'worker', nextMsg.msg );
      }

    } while( nextMsg && (nextMsg.type == 'in') ); 

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


/**
 * prepare a proper log entry for this message
 * @param   {String}    type          'in' (UI to Worker) or 'out' (Worker to UI)
 * @param   {Number}    msgNumber     number of this message
 * @param   {Object}    actMsg        received message
 * @param   {Object}    expMsg        expected message
 */
function logMsg( type, msgNumber, actMsg, expMsg ) {
  return `${(type == 'in') ? '->': '<-'} (${msgNumber}) [${expMsg.action}]`;
}


/**
 * log an error message resived (expectedly) from the server
 */
function logErrorMsg( msgNumber, msg ) {
  // get the error-stack
  let stack = ('params' in msg) && ('stack' in msg.params) ? msg.params.stack : '[no error-stack available]';
  stack = stack.replace( /^/gm, '               ' );
  return `${msg.params.src}
  
${stack}
`;
}
