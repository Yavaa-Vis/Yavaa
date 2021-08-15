"use strict";
const Express       = require( 'express' ),
      Path          = require( 'path' ),
      ChildProcess  = require( 'child_process' ),
      Fs            = require( 'fs' );

const localCfg = {
  port: 8080,
  webRoot:  Path.join( __dirname, 'webRoot'),
  jsRoot:   Path.join( __dirname, 'js'),
  dummyRoot:Path.join( __dirname, 'testdata'),
  libRoot:  Path.join( __dirname, 'lib'),
  tplRoot:  Path.join( __dirname, 'template' ),
  vizRoot:  Path.join( __dirname, 'js/modules/viz' ),
  initDir:  Path.join( __dirname, 'js/modules/server/init' )
};

(async function(){

  // clean console, if possible
  console.clear();
  /*
  if( 'getWindowSize' in process.stdout ) {
    var lines = process.stdout.getWindowSize()[1];
    for(var i = 0; i < lines; i++) {
        console.log('\r\n');
    }
  }
  */

  // run all init modules
  const initmodules = Fs.readdirSync( localCfg.initDir )
                        .filter( name => Path.extname(name) == '.js' )
                        .map(    name => Path.basename(name, '.js') )
                        .sort();
  for( const module of initmodules ) {

    try{
      // console.log( JSON.stringify( new Date ), 'running ' + module );
      await require( Path.join( localCfg.initDir, module ) )();
    } catch ( e ) {
      console.log( e );
      process.exit();
    }

  }

  // server setup
  const app = Express(),
        server = require('http').createServer( app ),
        io = require('socket.io')
              .listen( server, {
                'path':       '/ws',
                'log level':  1,
              });

  // root path for static content
  app.use(                Express.static( localCfg.webRoot )    );
  app.use( '/js',         Express.static( localCfg.jsRoot )     );
  app.use( '/testdata',   Express.static( localCfg.dummyRoot )  );
  app.use( '/lib',        Express.static( localCfg.libRoot )    );
  app.use( '/template',   Express.static( localCfg.tplRoot )    );
  app.use( '/viz',        Express.static( localCfg.vizRoot )    );


  // index.htm is the default document
  app.get('/', function (req, res) {
    res.sendFile( localCfg.webRoot + '/index.htm' );
  });

  // set up websocket
  io.sockets.on('connection', handleSocket );

  // error handler
  server.on( 'error', function( err ) {

    switch( err.code ) {
      case 'EACCES': console.log( JSON.stringify( new Date()), 'Port (' + localCfg.port + ') already in use. Shutting down.' ); break;
      default:       console.log( err.stack );
    }

    process.exit();
  });

  // start server
  server.listen( localCfg.port );

  // log
  console.log( JSON.stringify( new Date ), 'Server running on port ' + localCfg.port );


  // socket.io connection handling
  function handleSocket( socket ){

    // get client connection details: http://stackoverflow.com/a/24071662/1169798
    const connection  = socket.request.connection,
          clientIP    = connection.remoteAddress,
          clientPort  = connection.remotePort;

    // log
    console.log( JSON.stringify( new Date()), 'new client from ' + clientIP + ':' + clientPort + ' - ' + socket.id );

    // create new worker
    const engine = ChildProcess.fork( './js/Worker_node.js', [], { execArgv: [ '--expose-gc' ] } );

    engine.on('exit', function ( code, signal ) {
      if( code != 0 ) {
        console.log( JSON.stringify( new Date()), `worker for ${clientIP}:${clientPort} - ${socket.id} died unexpectedly` );
        socket.emit( 'worker', JSON.stringify({ action: 'error', params: {
          msg: 'Worker died unexpectedly!',
          ts:  Date.now(),
          src: 'startServer.js',
        } }) );
      } else {
        console.log( JSON.stringify( new Date()), `client died from ${clientIP}:${clientPort} - ${socket.id}` );
      }
      socket.disconnect();
    });

    // worker -> socket
    engine.on( 'message', function( msg ){

      // upon ready, send them the id
      if( msg == '"ready"' ) {
        engine.send( { action: 'sessionId', params: { id: socket.id } } );
        return;
      }

      // relay messages
      socket.emit( 'worker', msg );

    });

    // socket -> worker
    socket.on( 'worker', function( msg ){
      if( engine.connected ) {
        engine.send( msg );
      }
    });

  }

})()
.catch( e => console.log (e) );