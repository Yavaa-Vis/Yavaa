'use strict';
/**
 * search inside the metadata store
 * for a dataset using keywords in the title
 */
define( [ 'text!template/query/search/dsByRestriction/restrKeyword.rq' ],
function(                         restrTempl                           ){

  /**
   * factory function to preserve link to doQuery
   */
  function createFunction( doQuery ) {

    return function searchDataset( param ) {

      // call actual search
      return byKeyword( doQuery, param );

    }

  }


  /**
   * search by keyword in the datasets' titles
   */
  async function byKeyword( doQuery, param ) {

    // extract keywords
    const kw = param[ 'keywords' ]
    // remove any non-alpha-numeric characters
      .replace( /[^0-9a-z ]/gi, ' ' )
      .replace( /\s+/g, ' ' )
    // into single keywords
      .split( ' ' )
    // make the list of restrictions
      .map( (el) => restrTempl.replace( /{keyword}/gi, el ) );

    // run query
    const data = await doQuery( 'search/dsByRestriction', {
                         'restrictions': kw.join( "\n" )
                       });

    // process results
    return data.map( (el) => ({
      'ds':         el['ds']       ? el['ds']['value']        : null,
      'title':      el['title']    ? el['title']['value']     : null,
      'src':        el['src']      ? el['src']['value']       : null,
      'srcLabel':   el['srcLabel'] ? el['srcLabel']['value']  : null
    }) );

  }


  return createFunction;

});