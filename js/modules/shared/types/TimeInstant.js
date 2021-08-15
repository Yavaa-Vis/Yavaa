"use strict";
define( function(){

  function TimeInstant() {
    throw new Error( 'Abstract constructor called: TimeInstant' );
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Output Formats XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // http://pubs.opengroup.org/onlinepubs/007908799/xsh/strftime.html
  // TimeFormat.prototype.toString = new Function( 'return this._timestamp.toLocaleFormat("' + TimeInstant._formats[detail] +'");' );
  // just FF :-((
  TimeInstant._formats = [
      '%Y',                 // year
      '%Y %B',              // month
      '%Y-%m-%d',           // day
      '%Y-%m-%d %H:00',     // hour
      '%Y-%m-%d %R',        // minutes
      '%Y-%m-%d %R:%S',     // seconds
      '%Y-%m-%d %R:%S.'     // milliseconds
  ];

  TimeInstant._detailLevel = {
      'fullyear': 0,
      'year': 0,
      'month': 1,
      'day': 2,
      'hour': 3,
      'minute': 4,
      'seconds': 5,
      'millisecond': 6
  };

  var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

  TimeInstant._toString = [
      function(){ // year
        return this._timestamp.getUTCFullYear();
      },
      function(){ // month
        return this._timestamp.getUTCFullYear()
               + ' ' + months[ this._timestamp.getUTCMonth() ];
      },
      function(){ // day
        return  this._timestamp.getUTCFullYear()
                + '-' + twoDigit( this._timestamp.getUTCMonth() + 1 )
                + '-' + twoDigit( this._timestamp.getUTCDay() );
      },
      function(){ // hour
        return  this._timestamp.getUTCFullYear()
                + '-' + twoDigit( this._timestamp.getUTCMonth() + 1 )
                + '-' + twoDigit( this._timestamp.getUTCDay() )
                + ' ' + twoDigit( this._timestamp.getUTCHours() )
                + ':00';
      },
      function(){ // minute
        return  this._timestamp.getUTCFullYear()
                + '-' + twoDigit( this._timestamp.getUTCMonth() + 1 )
                + '-' + twoDigit( this._timestamp.getUTCDay() )
                + ' ' + twoDigit( this._timestamp.getUTCHours() )
                + ':' + twoDigit( this._timestamp.getUTCMinutes() );
      },
      function(){ // seconds
        return  this._timestamp.getUTCFullYear()
                + '-' + twoDigit( this._timestamp.getUTCMonth() + 1 )
                + '-' + twoDigit( this._timestamp.getUTCDay() )
                + ' ' + twoDigit( this._timestamp.getUTCHours() )
                + ':' + twoDigit( this._timestamp.getUTCMinutes() )
                + ':' + twoDigit( this._timestamp.getUTCSeconds() );
      },
      function(){ // millisecond
        return  this._timestamp.getUTCFullYear()
                + '-' + twoDigit( this._timestamp.getUTCMonth() + 1 )
                + '-' + twoDigit( this._timestamp.getUTCDay() )
                + ' ' + twoDigit( this._timestamp.getUTCHours() )
                + ':' + twoDigit( this._timestamp.getUTCMinutes() )
                + ':' + twoDigit( this._timestamp.getUTCSeconds() )
                + '.' + this._timestamp.getUTCMilliseconds();
      }
  ];


  TimeInstant.prototype.compare = function(other){
    if( !other ) {
      return 1;
    } else if( other instanceof Date ) {
      return this._timestamp.getTime() - other.getTime();
    } else if( other._type == this._type ){
      return this._timestamp.getTime() - other._timestamp.getTime();
    } else {
      return 1;
    }
  };

  function twoDigit( val ) {
    return val < 10 ? '0' + val : '' + val;
  }

  TimeInstant.prototype.toJSON = function( showTimestamp ){
    return showTimestamp === true
            ? this._timestamp.getTime()
            : this.toString();
  };

  TimeInstant.prototype.hash = function hash(){
    return this._timestamp.getTime();
  }

  TimeInstant.prototype['_type'] = 'TimeInstant';

  return TimeInstant;
});