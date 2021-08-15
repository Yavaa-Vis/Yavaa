"use strict";
/**
 * log messages to the console, if activated
 */
define( ['config/worker'],
function( Config ){

  function log( msg, level = log.LEVEL_INFO ) {

    // only show, if active
    if( level & (Config.logLevel == 0) ) {
      return;
    }

    // collect output
    const out = [ JSON.stringify(new Date()), ' ' ];

    // set log color for this entry
    switch( level ) {
      case log.LEVEL_DEBUG:   out.push( ColorCodes.green ); break;
      case log.LEVEL_INFO:    break;
      case log.LEVEL_WARNING: out.push( ColorCodes.yellow ); break;
      case log.LEVEL_ERROR:   out.push( ColorCodes.red ); break;
      default:                out.push( ColorCodes.normal );
    }

    // add the message
    if( msg instanceof Array ) {
      out.push( msg[0] );
      for( let i=1; i<msg.length; i++ ) {
        out.push( '\n                           ' );
        out.push( msg[i] );
      }
    } else {
      out.push( msg );
    }

    // reset the output color afterward
    out.push( ColorCodes.normal );

    // do output
    console.log( out.join('') );

  }


  // log levels
  log.LEVEL_DEBUG   = 1;
  log.LEVEL_INFO    = 2;
  log.LEVEL_WARNING = 4;
  log.LEVEL_ERROR   = 8;

  // color codes
  const ColorCodes = {
      normal:   '\x1b[0m',
      italic:   '\x1b[3m',
      bold:     '\x1b[1m',
      black:    '\x1b[90m',
      red:      '\x1b[91m',
      green:    '\x1b[92m',
      yellow:   '\x1b[93m',
      blue:     '\x1b[94m',
      magenta:  '\x1b[95m',
      cyan:     '\x1b[96m',
      white:    '\x1b[97m'
    };

  return log;

});