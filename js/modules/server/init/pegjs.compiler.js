"use strict";
/**
 * compile pegjs grammars
 *
 * *** JUST RUN ON SERVER ***
 *
 */
module.exports = async function pegjsCompiler(){

  // includes I
  const Fs      = require( 'fs' ),
        Path    = require( 'path' );

  // config
  const cfg = {
      appBase:    Path.join( __dirname, '..', '..' ),
      serverBase: Path.join( __dirname, '..', '..', '..', '..' ),
      grammars:   Path.join( __dirname, '..', '..', '..', '..', 'template', 'grammar' ),
      target:     Path.join( __dirname, '..', '..', 'grammar' ),

      extension: '.pegjs',
  };

  // includes II
  const Peg     = require( Path.join( cfg.serverBase, 'lib', 'peg.js', 'peg.min.js' ) );

  // grab list of grammars
  const files = Fs.readdirSync( cfg.grammars )
                  .filter( (filename) => filename.lastIndexOf( cfg.extension ) == ( filename.length - cfg.extension.length ) )

  // log
  console.log( JSON.stringify( new Date()), 'Searched for grammars - found: ' + files.length );


  // process all files
  for( let i=0; i<files.length; i++ ) {

    // read file contents
    let content = Fs.readFileSync( Path.join( cfg.grammars, files[i] ), 'utf8' );

    // create parser
    let parser = Peg.generate( content, {
      output:     'source',
      format:     'umd',
      exportVar:  files[i].replace( cfg.extension, '' ) + 'Parser',
    });

    // write file
    let targetFile = Path.join( cfg.target, files[i].replace( cfg.extension, '.js' ) );
    Fs.writeFileSync( targetFile, parser );

    // log
    console.log( JSON.stringify( new Date()), '   Written to ' + targetFile );

  }

}