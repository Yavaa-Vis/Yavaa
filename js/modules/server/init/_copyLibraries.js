"use strict";
/**
 * copy the current version of used libraries to the /lib subfolders
 * workaround to use npm for version control of those
 *
 * *** JUST RUN ON SERVER ***
 *
 */
module.exports = async function(){

  // includes
  const Fs      = require( 'fs' ),
        Path    = require( 'path' ),
        Glob    = require( 'glob' );

  // config
  const cfg = {
      libRoot: Path.join( __dirname, '..', '..', '..', '..', 'lib' ),
      modules: Path.join( __dirname, '..', '..', '..', '..', 'node_modules' ),
  };

  // log
  console.log( JSON.stringify( new Date()), 'Copy library files' );

  // find all sources.txt files in library
  const sources = Glob.sync( Path.join( cfg.libRoot, '**', 'sources.txt' ) );

  // process all sources
  for( let source of sources ) {

    // read file list
    const files = Fs.readFileSync( source, 'utf8' )
                    .split( '\n' )
                    .map( line => line.trim() )
                    .filter( line => line != '' )
                    .map( line => line.split( ':' )
                                      .map( f => f.trim() ) );

    // base folder
    const folder = Path.dirname( source );

    // copy files
    for( let file of files ) {

      // adjust paths for OS specific separators
      file[0] = file[0].replace( /\\/g, Path.sep );

      // get all names and paths
      const from  = Path.join( cfg.modules, file[0] ),
            fname = (file.length > 1) ? file[1] : Path.basename( from ),
            to    = Path.join( folder, fname );

      // copy
      Fs.copyFileSync( from, to );
      console.log( JSON.stringify( new Date()), `   copied ${to}` );
    }

  }

}