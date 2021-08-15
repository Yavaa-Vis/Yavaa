"use strict";
define( [], function() {

  const Http        = require( 'http' ),
        Url         = require( 'url' ),
        Querystring = require( 'querystring' ),
        RequestP    = require( 'request-promise-native' ),
        Request     = require( 'request' );

  /**
   * constructor
   */
  const RemoteFile = function RemoteFile( url, options ) {

    // save settings
    this._url = url;
    this._options = options ? JSON.parse( JSON.stringify(options) ) : {};

    // prepare event handler list
    this._events = {};

    // set default parameter
    this._options['method'] = this._options['method'] ? this._options['method'].toUpperCase() : 'GET';
    this._options['headers'] = this._options['headers'] || {
      'User-Agent': 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.2309.372 Safari/537.36'
    };
  };


  /**
   * Event handler
   */
  RemoteFile.prototype['on'] = function( event, cb ) {
    this._events[ event ] = this._events[ event ] || [];
    this._events[ event ].push( cb );
  }


  /**
   * execute Event
   */
  RemoteFile.prototype['_triggerEvent'] = function( ev, msg ) {

    // if there is no such event registered, we are done
    if( !(ev in this._events) ) {
      return;
    }

    // call all event handlers
    var handler = this._events[ev];
    for( var i=0; i<handler.length; i++ ) {
      handler[i]( msg );
    }

  }

  /**
   * get file contents as string
   */
  RemoteFile.prototype['getContents'] = async function(){

    // get data
    const options = this._prepareRequest();
    options[ 'resolveWithFullResponse' ] = true;
    const resp    = await RequestP( options );

    // check statuscode
    if( resp.statusCode !== 200 ) {

      // prep error
      const err = new Error('Failed to get file "' + this._url + '"! Returned HTTP statusCode: ' + resp.statusCode);
      this._triggerEvent( 'error', err );

      // return some more info
      err.details = {
          statusCode: resp.statusCode,
          msg:        str.join('')
      };

      // throw it
      throw err;

    }

    // done
    return resp.body;

  };




  /**
   * pipe through other processor
   */
  RemoteFile.prototype['pipe'] = function( target ) {

    // get request options
    const options = this._prepareRequest();

    // pipe the request
    Request( options ).pipe( target.getStream() );

    return target;

  };




  /**
   * doing the actual request
   */
  RemoteFile.prototype._prepareRequest = function _prepareRequest() {

    // init options
    const opt = {
        'uri':      this._url,
        'method':   this._options['method'],
        'headers':  this._options['headers'],

        // request-module specific settings
        followOriginalHttpMethod: true,

    };

    // parameters?
    if( typeof this._options['data'] != 'undefined' ) {

      if( opt['method'] == 'GET' ) {
        opt[ 'qs' ] = this._options['data'];
      } else {
        opt[ 'form' ] = this._options['data'];
      }

    }

    // if there are parameters, we need to set some headers
    if( (typeof this._options['data'] != 'undefined')
        && ( opt['method'] != 'GET')
        && !( 'Content-Type' in opt['headers'] ) ) {
      opt['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    return opt;

  };


  // return object
  return RemoteFile;

});