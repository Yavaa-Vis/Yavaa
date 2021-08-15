"use strict";
/**
 * initialize the list of supported file parsers
 *
 * *** JUST RUN ON SERVER ***
 *
 */
module.exports = async function(){

  // includes
  const Fs    = require( 'fs' ),
        Path  = require( 'path' );

  // config
  var cfg = {
      appBase:    Path.join( __dirname, '..', '..' ),
      serverBase: Path.join( __dirname, '..', '..', '..', '..' ),
      module:     'load/loader/'
  };

  // setup requirejs (needed to read the descriptions)
  var RequireJS = require( Path.join( __dirname, '..', '..', '..', '..', 'lib', 'requirejs', 'r' ) );
  RequireJS.config({
    'baseUrl': cfg.appBase
  });

  // load list of available descriptions from file system
  var list = Fs.readdirSync( Path.join( cfg.appBase, cfg.module ) )
               .filter( function( filename ){
                 var pos = filename.lastIndexOf( '.desc.js' );
                 return (pos > 0) && (pos == ( filename.length - 8));
               })
               .map( function( filename ){
                 return filename.substring( 0, filename.length - 8 );
               });

  // modules to be loaded
  const modules = list.map( function( filename ){
                       return cfg.module + filename + '.desc';
                     });

  // path to store the loader descriptions
  const path = Path.join( cfg.appBase, cfg.module, 'List.js' );

  // it's an async operation, but we have no easy access to util/requirePromise here
  return new Promise( (resolve, reject) => {

    try {

      // load descriptions
      RequireJS( modules, function(){

        // extract loaded modules
        var descriptions = Array.prototype.slice.call( arguments, 0 );

        // create basic info for all loader
        const info = [];
        for( let j=0; j<descriptions.length; j++ ) {

          // shortcut
          const desc = descriptions[j];

          // check validity
          if( !checkValidity( desc ) ){
            continue;
          }

          // get minimal info and add to result
          info.push({
            'name':     desc['name'],
            'desc':     desc['desc'],
            'ext':      desc['ext'],
            'module':   list[j]
          });

        }

        // write the shortened list of descriptions to file
        Fs.writeFileSync( path,
            'define(function(){return ' + JSON.stringify(info) + ';});' );


        // log
        console.log( JSON.stringify( new Date()), 'Initializing load/loader Parser list' );
        console.log( JSON.stringify( new Date()), '   Written to ' + path );

        // done
        resolve();

      });

    } catch( e ) {

      // relay error
      reject( e );

    }

  });

}


/**
 * checks the validity of a visualization description
 * @param desc
 * @param id
 * @returns {Boolean}
 */
function checkValidity( desc, id ) {

  // TODO
  return true;

}