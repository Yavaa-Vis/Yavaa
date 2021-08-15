"use strict";
/**
 * process the contents of a "delimiter separated values" file
 * and return arrays of the contained dataset parsed using the given parsers.
 *
 * settings
 *
 * name           | type    |   default     | desc
 * ------------------------------------------------------------------------------
 * delimiter      | String  | <autodetect>  | separator between two values
 * newline        | String  | <autodetect>  | separator between two rows
 * header         | Boolean | <autodetect>  | treat first row as header row?
 * rows           | Number  | <all>         | the number of rows to parse
 *
 */
define( [ 'basic/types/Null',
          'basic/types/ArbNumber',
          'basic/types/String',
          'papaparse'
        ],
function( NullType,
          ArbNumber,
          StringType,
          Parser
         ) {

  // test regexp for numeric column
  const regexpNum = /^\d*[\.,]?\d+$/;

  /**
   * process the contents of a "delimiter separated values" file
   * @param {string}  file      the file to be parsed
   * @param {Array}   parser    the parsers for each column
   * @param {Object*} settings  settings for parsing
   */
  return async function dsvParser( file, parser, settings ){

    // build config object
    var cfg = {
      'delimiter': settings && ('delimiter' in settings) ? settings['delimiter'] : undefined,
      'newline':   settings && ('newline' in settings)   ? settings['newline']   : undefined,
      // 'header':    settings['header'],
      'preview':   settings && ('rows' in settings)      ? settings['rows'] : undefined
    };

    // parse the file
    var res = Parser.parse( file, cfg );

    // extract data and remove surrounding whitespaces
    var data = res.data;
    for( var i=0; i<data.length; i++ ) {
      for( var j=0; j<data[i].length; j++ ){
        data[i][j] = data[i][j].trim();
      }
    }

    // do we need to guess types?
    var isNumeric;
    if( parser && (parser.length > 0) ) {

      // parser types are given, so look for ArbNumber
      isNumeric = [];
      for( var i=0; i<parser.length; i++ ) {
        if( parser == ArbNumber ) {
          isNumeric.push( true );
        } else {
          isNumeric.push( false );
        }
      }

    } else {

      // no parsers are given, so we have to guess ourselves
      // if the header flag is not set, we include the first
      isNumeric = guessNumeric( data, !settings['header'] );

      // set parsers
      parser = [];
      for( var i=0; i<isNumeric.length; i++ ) {
        if( isNumeric[i] ) {
          parser.push( ArbNumber );
        } else {
          parser.push( StringType );
        }
      }
    }

    // do we have header here?
    var hasHeader;
    if( 'header' in settings ) {
      hasHeader = settings['header'];
    } else {
      hasHeader = guessHeader( data, isNumeric );
    }

    // if no header row, we have to check, if the header matches the detected type
    if( !hasHeader ) {
      for( var i=0; i<parser.length; i++ ) {

        var isCellNumeric = regexpNum.test( data[i][0] );
        if( !isCellNumeric && isNumeric[i] ) {
          isNumeric[i] = false;
          parser[i] = StringType;
        }

      }
    }


    // if we have header, extract them
    var header;
    if( hasHeader ) {

      header = data.shift();

    } else {

      // set default header
      header = [];
      for( var i=0; i<parser.length; i++ ) {
        header.push( 'Column ' + (i + 1) );
      }

      // we might have to change some parsers

    }

    // parse data according to types
    var pData = [],
        lookup = [];  // lookup, so we reduce the memory footprint for string cols
    for( var i=0; i<parser.length; i++ ) {
      pData.push( [] );
      if( parser[i] == StringType ) {
        lookup.push( [] );
      } else {
        lookup.push( null );
      }
    }
    var nullInstance = NullType();
    for( var i=0; i<data.length; i++ ) {
      for( var j=0; j<data[i].length; j++ ) {

        // parse, if value exists
        if( data[i][j] ) {
          if( lookup[j] ) {
            if( !(data[i][j] in lookup[j]) ) {
              lookup[ data[i][j] ] = parser[ j ]( data[i][j] );
            }
            pData[j].push( lookup[ data[i][j] ] );
          } else {
            pData[j].push( parser[ j ]( data[i][j] ) );
          }
        } else {
          pData[j].push( nullInstance );
        }

      }
    }

    // the settings object we used
    settings = {
        'delimiter': res['meta']['delimiter'],
        'newline':   res['meta']['linebreak'],
        'header':    hasHeader,
    };

    // return collected data
    return {
      'data':       pData,
      'settings':   settings,
      'header':     header,
      'parser':     parser
    };

  };


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  /**
   * try to guess, which columns are numeric and which are string
   */
  function guessNumeric( data ) {

    // determine, where to start
    var startRow = data.length < 2 ? 0 : 1,
        isNumeric = [];
    for( var i=startRow; i<data.length; i++ ) {

      for( var j=0; j<data[i].length; j++ ) {

        var cellIsNumeric = regexpNum.test( data[i][j] );
        isNumeric[ j ] = ((typeof isNumeric[j] == 'undefined') || isNumeric[j]) && cellIsNumeric;

      }

    }

    return isNumeric;
  }


  /**
   * try to guess, whether the first row is a header row
   */
  function guessHeader( data, isNumeric ) {

    // if there is just one row, we do not consider it a header
    if( data.length < 2 ) {
      return false;
    }

    // if we have at least one col, where the col is numeric and the first row is not,
    // then we assume, there is a header row
    if( data.length > 0 ) {
      for( var i=0; i<isNumeric.length; i++ ) {

        var cellIsNumeric = regexpNum.test( data[0][i].trim() );

        if( !cellIsNumeric && isNumeric[i] ) {
          return true;
        }

      }
    }

    return false;
  }

});