"use strict";
/**
 * for a given column resolve all the entities' labels
 *
 */
define( [
  'basic/Constants',
], function(
  Constants
){

  return async function resolveEntities( ds, col ){

    // only works for semantic columns
    if( col.getDatatype() != Constants.DATATYPE.SEMANTIC ) {
      throw new Error( 'Only applicable for semantic columns.' );
    }

    // get distinct values
    await ds.findDistinctValues( col );
    const distVals = col.getDistinctValues();

    // collect distinct constructors
    const constructors = new Set();
    for( const val of distVals.list ) {
      constructors.add( val.constructor );
    }

    // trigger resolving for all for them
    await Promise.all( [... constructors].map( (c) => c.resolveEntities() ) );

  };

});