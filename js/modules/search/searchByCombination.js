"use strict";
/**
 * given is a user query for a dataset consisting of column definitions and possibly value (ranges) for them
 * as well as a list of candidate datasets as created by metastore.searchDatasetByConstraint
 *
 * output is a workflow to combine the given datasets to match the user query as far as possible
 *
 */
define( [
    'basic/Constants',
    'search/searchByCombination/getCoverage',
    'search/searchByCombination/createPseudoworkflow',
    'search/searchByCombination/processResults',
    'search/searchByCombination/cleanUp',
], function(
    Constants,
    getCoverage,
    createPseudoworkflow,
    processResults,
    cleanUp
){

  /**
   * find a combination of the datasets given by candidates to match as much as possible from query
   *
   * returns the workflow
   *
   * @param   {Array}     query         region specification
   * @param   {Array}     candidates    list of candidate datasets
   * @returns {Object}
   */
  return async function searchByCombination( query, candidates ) {

    // without candidates, there is nothing, we can do
    if( !candidates || (candidates.length < 1) ) {
      return {
        pwf:        {},
        components: [],
        result:     null,
      };
    }

    // nake sure some data formats are respected
    query.forEach( (col) => {
      switch( col.datatype ) {

        // date types
        case Constants.DATATYPE.TIME: {
          if( [ 'number', 'string' ].includes( typeof col.minValue ) ) {
            col.minValue = new Date( col.minValue );
          }
          if( [ 'number', 'string' ].includes( typeof col.maxValue ) ) {
            col.maxValue = new Date( col.maxValue );
          }
          break;
        }

        // numeric types
        case Constants.DATATYPE.NUMERIC: {
          if( [ 'string' ].includes( typeof col.minValue ) ) {
            col.minValue = parseFloat( col.minValue );
          }
          if( [ 'string' ].includes( typeof col.maxValue ) ) {
            col.maxValue = parseFloat( col.maxValue );
          }
          break;
        }
      }
    });

    // get a list of datasets, that cover the query as best as possible
    const coverage = getCoverage( query, candidates );

    // trigger postprocessing
    // not part of getCoverage, because it uses MetaStore to fetch real data
    // which makes testing with artificial data quite hard
    const res = await processResults( query, coverage )

    // get list of used datasets
    const usedDs = res.components;

    // create pseudo-workflow
    const pwf = (usedDs.length > 0) ? createPseudoworkflow( usedDs ) : null;

    // remove unused datasets again
    const cleanData = cleanUp( usedDs, pwf );

    // return all data
    return {
      pwf:        cleanData.pwf,
      components: cleanData.datasets,
      result:     res.result
    }

  };

});