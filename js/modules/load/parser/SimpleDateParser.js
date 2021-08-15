"use strict";
/**
 * create a simple (dynamic) parser for several date/time formats
 */
define( [ 'shared/types/TimeInstant' ],
function(    TimeInstant             ){

  return function Factory( regex, meaning ) {
    // the detail-level of the created class
    var detail = 0;

    // create constructor source
    // base time is one second after epoch to prevent ambiguities
    var source = `"use strict";

                  // make sure we are called in constructor mode
                  if( !new.target ) {
                    return new TimeFormat( val );
                  }

                  this._timestamp = new Date( 1000 );
                  var matches = this._regex.exec(val);
                  if(!matches) {
                    throw new Error( "Could not parse time string \'" + val + "\'!" );
                    return;
                  }`;
    for( var i=meaning.length; i--; ) {
      switch( meaning[i] ) {
        case 'fullyear':    source += 'this._timestamp.setUTCFullYear( parseInt( matches[' + (i+1) + '], 10 ) );';
                            break;
        case 'year':        source += 'this._timestamp.setUTCFullYear( parseInt( matches[' + (i+1) + '], 10 ) );';
                            break;
        case 'month':       source += 'this._timestamp.setUTCMonth( parseInt( matches[' + (i+1) + '], 10 ) - 1 );';
                            break;
        case 'day':         source += 'this._timestamp.setUTCDate( parseInt( matches[' + (i+1) + '], 10 ) );';
                            break;
        case 'hour':        source += 'this._timestamp.setUTCHours( parseInt( matches[' + (i+1) + '], 10 ) );';
                            break;
        case 'minute':      source += 'this._timestamp.setUTCMinutes( parseInt( matches[' + (i+1) + '], 10 ) );';
                            break;
        case 'second':      source += 'this._timestamp.setUTCSeconds( parseInt( matches[' + (i+1) + '], 10 ) );';
                            break;
        case 'millisecond': source += 'this._timestamp.setUTCSeconds( parseInt( matches[' + (i+1) + '], 10 ) );';
                            break;
        case 'quarter':     source += 'this._timestamp.setUTCMonth( Math.trunc( parseInt( matches[' + (i+1) + '], 10 ) / 4 ) );';
                            break;
        case 'semester':    source += 'this._timestamp.setUTCMonth( Math.trunc( parseInt( matches[' + (i+1) + '], 10 ) / 2 ) );';
                            break;
        default: throw new Error( "Unknown TimeInstant meaning: " + meaning[i] );
      }
      detail = detail > TimeInstant._detailLevel[ meaning[i] ] ? detail : TimeInstant._detailLevel[ meaning[i] ];
    }

    // create constructor
    var TimeFormat = new Function( 'return function TimeFormat( val ){' + source +'}' )();

    // set prototype to TimeInstant
    TimeFormat.prototype = Object.create( TimeInstant.prototype );
    TimeFormat['_type'] = 'TimeInstant';

    // set constructor
    TimeFormat.prototype.constructor = TimeFormat;

    // save reference to regex
    TimeFormat.prototype._regex = new RegExp( regex );

    // save detaillevel
    Object.defineProperty( TimeFormat.prototype, "_detail",      { value: detail,   writable: true } );

    // toString Handler
    TimeFormat.prototype.toString = TimeInstant._toString[ detail ];

    // return result
    return TimeFormat;
  };

});