/**
 * access metadata store provided at given SPARQL endpoint
 *
 */
"use strict";
define( [ 'config/metadata.sparql',
          'util/requirePromise',
          'load/SparqlClient',
          'store/metadata.sparql/getMetadata' ,
          'store/metadata.sparql/getDistributions',
          'store/metadata.sparql/getColumns',
          'store/metadata.sparql/resolveTimeType',
          'store/metadata.sparql/searchDatasetByKeyword',
          'store/metadata.sparql/searchDatasetByConstraint',
          'store/metadata.sparql/resolveName',
          'store/metadata.sparql/typeAhead',
          'store/metadata.sparql/getCodelistValues',
          'store/metadata.sparql/resolveCodelistValueURIs',
          'store/metadata.sparql/resolveCodelistValueShort',
          'store/metadata.sparql/resolveValueShort',
          ],
function( cfg,
          requireP,
          SparqlClient,
          getMetadata,
          getDistributions,
          getColumns,
          resolveTimeType,
          searchDatasetByKeyword,
          searchDatasetByConstraint,
          resolveName,
          typeAhead,
          getCodelistValues,
          resolveCodelistValueURIs,
          resolveCodelistValueShort,
          resolveValueShort
        ){

  // get a pointer to the SPARQL client
  var client = new SparqlClient( cfg['metadata']['endpoint'] );

  /**
   * execute the actual SPARQL query
   */
  async function doQuery( query, param, cb ) {

    // load query
    const queryText = await requireP( 'text!template/query/' + query + '.rq' );

    // execute query
    try {

      const req = await client['query']( queryText, param );

      return req;

    } catch( e ) {

      e.message = 'Query (' + query + ') failed:\n' + e.message;

      throw e;

    }

  }


  // collect all methods and return them
  return {
    'getMetadata':      getMetadata( doQuery ),
    'getDistributions': getDistributions( doQuery ),
    'getColumns':       getColumns( doQuery ),
    'resolveTimeType':  resolveTimeType( doQuery ),
    'searchDataset':    searchDatasetByKeyword( doQuery ),
    'searchDatasetByConstraint': searchDatasetByConstraint( doQuery ),
    'resolveName':      resolveName( doQuery ),
    'typeAhead':        typeAhead( doQuery ),
    'getCodelistValues':getCodelistValues( doQuery ),
    'resolveCodelistValueURIs': resolveCodelistValueURIs( doQuery ),
    'resolveCodelistValueShort': resolveCodelistValueShort( doQuery ),
    'resolveValueShort':  resolveValueShort( doQuery ),
  };

});