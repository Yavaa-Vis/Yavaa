"use strict";
/**
 * provide search functionality
 */
define( [ 'util/requirePromise', 'store/metadata' ],
function(  requireP            ,     metaStore    ){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX doSearch XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  async function doSearch( param ) {

    // get search results
    const data = await metaStore.searchDataset( param['restrictions'] );

    // return with wrapper
    return {
      'action': 'search',
      'params': {
        'results': data
      }
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX typeAhead XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return list of possible terms for the typeahead/autocomplete functionality
   *
   * parameters
   * name       | type      | required  | desc
   * -------------------------------------------
   * needle     | String    | Y         | the current given substring to search for
   * type       | String    | Y         | type for which to search (dimension, measurement, column, value)
   * codelist   | String    | N         | codelist, to which to limit the search; only applies, when type==value
   */
  async function typeAhead( param ) {

    // get type for typeahead
    var type, codelist;
    switch( ('' + param['type']).toLowerCase() ) {
      case 'value':       type = metaStore.typeAhead.TYPE_VALUE;
                          codelist = param['codelist'];
                          break;
      case 'dimension':   type = metaStore.typeAhead.TYPE_DIMENSION;    break;
      case 'measurement': type = metaStore.typeAhead.TYPE_MEASUREMENT;  break;
      case 'dataset':     type = metaStore.typeAhead.TYPE_DATASET;      break;
      default:            type = metaStore.typeAhead.TYPE_COLUMN;       break;
    }

    // get the data and forward
    const res = await metaStore.typeAhead( param['needle'], 10, type, codelist )
    return {
      'action': 'typeAhead',
      'params': {
        'terms': res,
        'type':  ('' + param['type']).toLowerCase(),
      }
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getDsByCombination XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX*/

  async function searchByCombination( param ) {

    // empty request gets empty results
    if( !('constraints' in param) || !Array.isArray(param.constraints) || (param.constraints.length < 2)) {
      return Promise.reject( new Error( 'Missing parameters in request!' ) );
    }

    // get needed modules
    const search = await requireP( 'search/searchByCombination' );

    try {

      // get candidates
      const cand = await metaStore.searchDatasetByConstraint({ constraints: param.constraints });

      // trigger the search
      const res = await search( param.constraints, cand );

      // resolve the promise
      return {
        action: 'getDsByCombination',
        params: res,
      };

    } catch (e) {

      // forward the error
      return Promise.reject(e);

    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX*/

  return {
    'doSearch':             doSearch,
    'typeAhead':            typeAhead,
    'searchByCombination':  searchByCombination,
  };
});