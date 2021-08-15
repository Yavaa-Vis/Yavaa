"use strict";
/**
 * creates the source code for a specific filter (part)
 * input is a definition object
 * output is a (boolean) filter function
 *
 * TODO describe input format
 */
define( [ 'basic/types/ArbNumber'
        ],
function(
          ArbNumber
        ){

  return async function createFilter( def ) {

    // get the code for the filter
    const filter = buildFilterSource( def );

    // build function
    let funktion;
    if( 'cfg' in filter ) {

      // we need to pass a config object to the filter

      funktion = new Function( 'cfg', 'return function( row ){ return ' + filter.source + '; };' );
      funktion = funktion( filter.cfg );

    } else {

      // it is just the function body
      funktion = new Function( 'row', 'return ' + filter.source );

    }


    // create a list of columns used for that filter
    const cols = {};
    for( var i=filter.usedCols.length; i--; ) {
      cols[ filter.usedCols[i] ] = true;
    }

    // attach list of used columns to filter function
    funktion['usedCols'] = Object.keys( cols )
                                 .map( function(el){
                                   return +el;
                                 });

    // resolve result
    return funktion;

  };



  /**
   * build the actual source code
   * @param   {Object}  def             the filter definition
   * @returns {String}                  source code representing the filter
   */
  function buildFilterSource( def, unique ) {

    let res, values, cfg;

    // default value
    unique = unique || 0;

    switch( def['operator'].toUpperCase() ) {

      /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX StringFilter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
      case 'EntityFilter'.toUpperCase():
      case 'StringFilter'.toUpperCase():

        // make sure value list is an array
        if( !(def['values'] instanceof Array) ) {
          values = [ def['values'] ];
        } else {
          values = def['values'];
        }

        // make sure all values are strings
        values = values.map( function( el ){
          return ( typeof el == 'string' ) ? el : el + '';
        });

        // detect, whether value is in list
        res = JSON.stringify( values ) + '.indexOf ( row[' + def['column'] + '].getURI() )';

        // is this an include or exclude filter?
        res += def['include'] ? '>-1'
                              : '<0';

        // return
        return {
          source:   res,
          usedCols: [ def['column'] ]
        };

      /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX NumberRangeFilter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
      case 'NumberRangeFilter'.toUpperCase():

        // we need to constants here
        cfg = {
          ['min' + unique]: new ArbNumber( def['values']['min'] ),
          ['max' + unique]: new ArbNumber( def['values']['max'] )
        };

        // source
        res = '(row[' + def['column'] + '] !== null) && \
               (row[' + def['column'] + '].compare( cfg.min' + unique + ' ) >= 0) && \
               (row[' + def['column'] + '].compare( cfg.max' + unique + ' ) <= 0)';

        // return
        return {
          source: res,
          cfg: cfg,
          usedCols: [ def['column'] ]
        };

      /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DateRangeFilter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
      case 'DateRangeFilter'.toUpperCase():

        // we need to constants here
        cfg = {
          ['min' + unique]: new Date( def['values']['min'] ),
          ['max' + unique]: new Date( def['values']['max'] )
        };

        // source
        res = '(row[' + def['column'] + '] !== null) && \
               (row[' + def['column'] + '].compare( cfg.min' + unique + ' ) >= 0) && \
               (row[' + def['column'] + '].compare( cfg.max' + unique + ' ) <= 0)';

        // return
        return {
          source: res,
          cfg: cfg,
          usedCols: [ def['column'] ]
        };

      /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX AND - Operator XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
      case 'AND':

        // first we need to convert all children recursively
        let components = def.values.map( (c) => buildFilterSource( c, ++unique )  );

        // noew collect all config definitions and used columns
        cfg = {};
        let usedCols = new Set();
        components
          .forEach( (c) => {

            // collect used columns
            ('usedCols' in c ) && c
              .usedCols
              .forEach( (col) => usedCols.add( col ) );

            // collect config items
            ('cfg' in c) && Object
              .keys( c.cfg )
              .forEach( (key) => { cfg[ key ] = c.cfg[ key ]; });

          });

        // now we connect the source codes
        res = components.map( (c) => '(' + c.source + ')' ).join( ' && ');

        // and return everything
        return {
          source:   res,
          cfg:      cfg,
          usedCols: [ ... usedCols ]
        };

      default: /* unknown operator */

        throw new Error( 'Unknown operator: ' + def['operator'] );

    }
  }

});