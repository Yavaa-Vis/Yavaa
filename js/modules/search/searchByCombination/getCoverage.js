"use strict";
/**
 * given is a user query for a dataset consisting of column definitions and possibly value (ranges) for them
 * as well as a list of candidate datasets as created by metastore.searchDatasetByConstraint
 *
 * output is a workflow to combine the given datasets to match the user query as far as possible
 * structure:
 * - pwf:         the pseudo-workflow creating this result
 * - components:  involved datasets, including filters
 * - result:      the resulting dataset given by its columns
 *
 */
define( [
    'search/searchByCombination/getIntersection',
    'search/searchByCombination/rateCandidate',
    'search/searchByCombination/reorderCandidate',
    'search/searchByCombination/createSubregions',
    'search/searchByCombination/Results',
], function(
    getIntersection,
    rateCandidate,
    reorderCandidate,
    createSubregions,
    Results
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
  return function getCoverage( query, candidates ) {

    // reorder candidate columns according to searched region
    candidates.forEach( ( cand ) => {
      const reordered = reorderCandidate( query, cand.covers );
      cand.covers = reordered;
    });

    // prepare search results collection
    const resultCollection = new Results();

    // actual search
    search( query, candidates, resultCollection, null );

    // return used datasets
    return resultCollection.getAll();

  };


  /**
   * actual recursive search for a combination
   */
  function search( query, candidates, resultCollection, parentRegionId ) {

    // for each candidate calculate the intersection, if this candidate would be chosen
    // intersection == ( remainder, filter/overlap )
    let candList = candidates.map( (cand) => {

      // intersect region and dataset
      const intersection = getIntersection( query, cand.covers )

      // add the candidate for reference
      intersection.cand = cand;

      return intersection;

    });

    // rate candidates in relation to query
    candList.forEach( (cand) => {
      cand.rating = rateCandidate( query, cand.cand.totalDimCount, cand.cand.covers, cand.filter );
    });

    // remove not matching
    candList = candList.filter( (cand) => {
      return cand.rating[0] > 0;
    });

    // if there are no candidates left, we stop
    if( candList.length < 1 ){
      return [];
    }

    // sort by ranking
    candList.sort( (a, b) => {
      let diff;
      for( let i=0; i<a.rating.length; i++ ){
        diff = b.rating[i] - a.rating[i];
        if( diff ) {
          return diff;
        }
      }
      return 0;
    });

    // get best match and add it to result
    const bestMatch = candList.shift(),
          regionId  = resultCollection.createRegionId();
    bestMatch.regionId = regionId;
    bestMatch.parentRegionId = parentRegionId;
    resultCollection.add( bestMatch );

    // do we need to proceed?
    if( candList.length > 0 ){

      // create all subregions to query for
      const subregions = createSubregions( query, bestMatch.remainder, bestMatch.cand );

      // call recursive for remaining regions, if existing
      if( (subregions.size > 0) && (candList.length > 0) ) {

        subregions.forEach( (subregion) => {

          // search recursively for subregions
          const subBestMatch = search( subregion, candList.map( (cand) => (cand.cand) ), resultCollection, regionId );

        });

      }
    }
    return bestMatch;

  }

});