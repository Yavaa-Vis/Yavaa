"use strict";
/**
 * provide functionality to retrieve certain information
 * this does NOT include search and related functionalities
 *
 */
define( [ 'store/metadata', 'util/requirePromise' ],
function(     metaStore   ,  requireP ){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX resolveLabels XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * for the given list of URIs try to find an appropriate label
   *
   * parameters
   * name       | type            | required  | desc
   * -----------------------------------------------------------------
   * uris       | Array[String ]  | Y         | list of URIs to resolve
   */
  async function resolveLabels( param ) {

    // check for empty parameter list
    if( !('uris' in param) || !Array.isArray(param.uris) || (param.uris.length < 1) ) {
      return {};
    }

    // execute resolving
    const resolved = await metaStore.resolveName( param['uris'] )

    // return the resolved values
    return {
      'action': 'resolvedLabels',
      'params': {
        'results': resolved
      }
    };

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX resolveCodelists XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * for the given codelists return all items included in the codelists
   * items will be returned with URI and label
   *
   * parameters
   * name       | type            | required  | desc
   * -----------------------------------------------------------------
   * uris       | Array[String ]  | Y         | list of URIs to codelists
   */
  async function resolveCodelists( param ) {

    // check for empty parameter list
    if( !('uris' in param) || !Array.isArray(param.uris) || (param.uris.length < 1) ) {
      return Promise.resolve( {} );
    }

    // get values
    const codelists = await metaStore.getCodelistValues( param['uris'] )

    // collect all appearing values
    let values = new Set();
    Object.keys( codelists )
          .forEach( (cl) => {
            codelists[ cl ].forEach( (val) => values.add( val ) );
          });

    // run query to resolve labels for them
    let lookup = {};
    if( values.size > 0 ){
      lookup = await metaStore.resolveName( [ ... values ] );
    }


    // augment all codelists with value objects
    Object.keys( codelists )
          .forEach( (cl) => {
            codelists[ cl ] = codelists[ cl ].map( (uri) => {
                                                return {
                                                  uri: uri,
                                                  label: lookup[uri]
                                                }
                                              });
          });

    return {
      'action': 'resolvedCodelists',
      'params': {
        'results': codelists
      }
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getDsDetails XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX*/

  const mappings = {
      title: 'http://purl.org/dc/terms/title',
      publisher: 'http://purl.org/dc/terms/publisher'
  };

  async function getDsDetails( param ) {

    // get dataset meta data
    const metaReq = metaStore.getMetadata( param['id'] );

    // get column data
    const colsReq = metaStore.getColumns( param['id'] );

    // return results
    const [ meta, cols ] = await Promise.all( [ metaReq, colsReq ] );

    // resolve name for publisher
    const names = await metaStore.resolveName( meta[mappings.publisher][0] );

    // map meta properties
    const metaResult = {
      'title':  meta[mappings.title][0],
      'src':    names[ meta[mappings.publisher][0] ]
    };

    // return with wrapper
    return {
      'action': 'dsDetails',
      'params': {
        'meta': metaResult,
        'cols': cols.filter( function(el){ return el !== null; } )
      }
    };

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX resolveColValues XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX*/


  /**
   * trigger (label-) resolving for all submitted columns
   *
   * parameters
   * name       | type            | required  | desc
   * -----------------------------------------------------------------
   * data_id    | Number          | Y         | dataset referenced
   * columns    | Array[Number]   | Y         | the columns to be resolved
   */
   async function resolveColValues( param ) {

    // check for empty parameter list
    if( !('data_id' in param) || !('columns' in param) ) {
      throw new Error( 'Missing parameters!' );
    }

    // we will need some constants
    const Constants = await requireP( 'basic/Constants' );

    // get a reference to the dataset
    const DataStore = await requireP( 'store/data' ),
          ds        = DataStore.getDataset( param.data_id );

    // get involved columns; recheck, that they are semantic
    const cols      = ds.getColumnMeta(),
          selCols   = cols.filter( (el) => {
            return param.columns.includes( el.getID() )
                   && (el.getDatatype() == Constants.DATATYPE.SEMANTIC);
          });

    // if there are columns left, trigger their resolving
    const resolveEntities = await requireP( 'helper/resolveEntities' );
    await Promise.all( selCols.map( (c) => resolveEntities( ds, c ) ) );

    // we are done
    return {
      'action': 'done',
      'params': {
        'data_id': param.data_id,
      }
    };
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX*/

  return {
    'getDsDetails':       getDsDetails,
    'resolveLabels':      resolveLabels,
    'resolveCodelists':   resolveCodelists,
    'resolveColValues':   resolveColValues,
  };
});