/**
 * provides the client for a SPARQL endpoint
 *
 */
"use strict";
define( ['load/RemoteFile'], function( RemoteFile ){

  // constants
  const DEBUG = false;    // do some debug output

  var Client = function Client( endpoint, options ) {

    this.endpoint = endpoint;
    this.options = options || {};

  };

  /**
   * endpoint for select queries
   * @param query
   * @param bindings
   * @returns   {Promise}
   */
  Client.prototype.query = function query( query, bindings ) {
    return this._doQuery( query, bindings )
               .then( function( data ){
                 return data['results']['bindings'];
               });
  }


  /**
   * endpoint for ask queries
   * returns just boolean
   * @param query
   * @param bindings
   * @returns   {Promise}
   */
  Client.prototype.ask = function ask( query, bindings ) {
    return this._doQuery( query, bindings )
               .then( function( data ){
                 return !!data.boolean;
               });
  }


  /**
   * perform the actual query
   * @param query
   * @param bindings
   * @returns   {Promise}
   */
  Client.prototype._doQuery = async function( query, bindings ) {

    // do bindings and prepare query
    query = this.prepareQuery( query, bindings );
    let start;
    if( DEBUG ) {
      console.log( '-------------------------------------------------------------------------------' );
      console.log( 'sending query ...' )
      console.log( query );
      start = Date.now();
    }

    // trigger request
    var req = new RemoteFile( this.endpoint, {
      'method': 'POST',
      'data': {
        'query': query,
        'output': 'json'
      },
      'headers': {
        'Accept': 'application/json'
      }

    });

    try {
      // react on results
      const data = await req.getContents();

      // parse data
      const parsed = JSON.parse( data );

      // debug output
      if( DEBUG ) {
        console.log( `... got results (# ${parsed.results.bindings.length}) after ${Date.now() - start} \n\n` );
        console.log( '-------------------------------------------------------------------------------' );
      }

      // done
      return parsed;

    } catch( e ) {

      if( ('details' in e) && ('msg' in e.details) && (e.details.msg) ) {
        let newE = new Error( 'Invalid query (' + e.details.msg + ') \n' + query );
        newE.details = e.details;
        throw newE;
      } else {
        throw( e );
      }

    }

  };


  var regexpWhitespace = /\s+/;
  /**
   * prepare a given query by replacing all bindings inside,
   * removing comments and replacing unnecessary whitespaces
   * @param {String}    query
   * @param {Object}    bindings
   * @returns {String}
   */
  Client.prototype.prepareQuery = function prepareQuery( query, bindings ){

    // default object for bindings
    bindings = bindings || {};

    // remove comments and empty rows
    var lines = query.split( "\n" );
    lines = lines.map( function( line ){
                    return line.replace( regexpWhitespace, ' ' ).trim();
                  })
                  .filter( function( line ){
                    return (line != '') && (line.charAt( 0 ) != '#');
                  });
    query = lines.join( "\n" );

    // apply bindings
    var keys = Object.keys( bindings );
    for( var i=keys.length; i--; ) {

      // prepare value and pattern
      var pattern = new RegExp('{' + keys[i] + '}', 'g'),
          value   = bindings[ keys[i] ];
      if( value instanceof Array ) {
        value = value.map( encodeValue )
                     .join( ' ' );
      } else {
        value = encodeValue( value );
      }

      // replace
      query = query.replace( pattern, value );

    }

    return query;

  }



  return Client;


  /* XXXXXXXXXXXXXXXXXXXXXXXXX Uitility Functions XXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * encode value according to SPARQL standards
   * primitives will be returned unchanged
   * @param {*} val
   */
  function encodeValue( val ) {

    // we do not consider primitives
    if( !(val instanceof Object) || !('type' in val) ) {
      return val;
    }

    switch( ('' + val['type']).toUpperCase() ) {

      case 'URI':
      case 'URL': return '<' + val['value'] + '>';

      case 'STRING': return '"' + val['value'] + '"';

      default: return val;

    }
  }

});
