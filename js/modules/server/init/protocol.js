"use strict";
/**
 * convert the protocol XML to the respective JSON version
 *
 * *** JUST RUN ON SERVER ***
 *
 */
module.exports = async function(){

  // includes
  const Fs      = require( 'fs' ),
        Path    = require( 'path' ),
        Cheerio = require( 'cheerio' );

  // config
  const cfg = {
      appBase:      Path.join( __dirname, '..', '..' ),
      serverBase:   Path.join( __dirname, '..', '..', '..', '..' ),
      sourceFile:   Path.join( __dirname, '..', '..', '..', '..', 'docu', 'protocol.xml' ),
      targetFileIn: Path.join( __dirname, '..', '..', 'basic', 'protocol_server.in.js' ),
      targetFileOut:Path.join( __dirname, '..', '..', 'basic', 'protocol_server.out.js' ),
  };

  // read source file
  const $ = Cheerio.load( Fs.readFileSync( cfg.sourceFile, 'utf8' ), {xmlMode: true} );

  // get list of commands
  const defIncoming = parseDefinitions( $( 'sectionpart[direction="UI2W"] command') ),
        defOutgoing = parseDefinitions( $( 'sectionpart[direction="W2UI"] command') );

  // write result to file
  let output = 'define( ' + JSON.stringify( defIncoming ) + ');';
  Fs.writeFileSync( cfg.targetFileIn, output );
  output = 'define( ' + JSON.stringify( defOutgoing ) + ');';
  Fs.writeFileSync( cfg.targetFileOut, output );

  // log
  console.log( JSON.stringify( new Date()), 'Parsed protocol.xml' );
  console.log( JSON.stringify( new Date()), '   Written to ' + cfg.targetFileIn );
  console.log( JSON.stringify( new Date()), '   Written to ' + cfg.targetFileOut );


  /**
   * parse the subset of commands into a single object
   * @param   {Cheerio}       the list of params
   * @return  {Object}        lookup of parsed message definitions
   */
  function parseDefinitions( msgDefs ) {

    // extract data from command
    let result = {},
        name   = '',
        params = [],
        module = '',
        method = '',
        $com, $binding, $el, parsedType, enumeration, arrayType;
    for( let i=0; i<msgDefs.length; i++ ) {

      // shortcuts
      $com = $( msgDefs[i] );
      params = [];

      // name
      name = $com.attr( 'name' );

      // binding
      $binding = $com.find( 'binding' );
      module = $binding.attr( 'module' );
      method = $binding.attr( 'method' );

      // params
      $com.find( 'param' ).each( function( index, el ) {
        $el = $(el);

        // recognize enumerations
        try {
          enumeration = JSON.parse( $el.attr( 'type' ) );
          parsedType = 'enum';
        } catch(e) {
          parsedType = $el.attr( 'type' );
          enumeration = undefined;
        }

        // regocnize alternatives
        if( parsedType.includes( '|' ) ) {
          parsedType = parsedType.split( '|' );
        } else {
          parsedType = [ parsedType ];
        }

        // extract array types
        arrayType = parsedType.map( t => { const types = t.match( /^array\[(.*)\]$/i ); return types ? types[1] : null; } )
                              .filter( t => t )
                              .map( t => t.toLowerCase() );

        // switch to use only lower case types as JS does
        parsedType = parsedType.map( t => t.toLowerCase() );

        // if we have typed arrays, the type is still just array
        if( arrayType.length > 0 ) {
          parsedType = parsedType.filter( t => t.substr( 0, 5 ) != 'array');
          parsedType.push( 'array' );
        }

        // insert parameter
        params.push( {
            'name':         $el.attr( 'name' ),
            'type':         parsedType,
            'enumeration':  enumeration,
            'arraytype':    arrayType.length > 0 ? arrayType : undefined,
            'optional':     $el.attr( 'optional' ) ? true : undefined
          } );
      } );


      // add to result
      result[ name ] = {
        'binding': {
          'module': module,
          'method': method
        },
        'params': params
      };
    }

    // done
    return result;

  }

}