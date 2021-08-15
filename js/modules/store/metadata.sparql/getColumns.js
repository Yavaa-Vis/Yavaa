"use strict";
/**
 * retrieve the column descriptions for a dataset
 */
define([
  'basic/Constants',
  'util/flatten.sparql',
], function( Constants,
             flatten ){

  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return async function getColumns( ids ){

      // format URIs for request
      let req;
      if( ids instanceof Array ) {
        req = ids.map( (id) => { return { type: 'uri', value: id }; } );
      } else {
        req = [ { type: 'uri', value: ids } ];
      }

      // run query
      let data = await doQuery( 'dataset/columns', {
                    'uri': req
                 });

      // flatten result
      data = flatten( data );

      // convert results
      var parsed = {};
      data
        .forEach( (entry) => {

          // determine datatype; order of options important for "time"!
          switch( true ) {
            case ('time' in entry):       entry['datatype'] = Constants.DATATYPE.TIME;     break;
            case ('numeric' in entry ):   entry['datatype'] = Constants.DATATYPE.NUMERIC;  break;
            case ('codelist' in entry):   entry['datatype'] = Constants.DATATYPE.SEMANTIC; break;
            default:                      entry['datatype'] = Constants.DATATYPE.STRING;
          }

          // add to result
          parsed[ entry.ds ] = parsed[ entry.ds ] || [];
          parsed[ entry.ds ][ entry['order'] ] = entry;

          // remove ds property
          delete entry.ds;

        });

      // pass on result
      if( ids instanceof Array ) {

        return parsed;

      } else {

        // if just one dataset was requested, we have to extract it
        return parsed[ Object.keys(parsed)[0] ];

      }

    };

  }


  return createFunction;

});