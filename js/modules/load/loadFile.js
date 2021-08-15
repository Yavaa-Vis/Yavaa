/**
 * Trigger the loading of a dataset
 * - ask in metadata-store for dataset's metadata
 * - load file
 * - relay file contents to respective loader
 */
"use strict";
define( [ 'store/data',
          'basic/Constants',
          'basic/types/Dataset',
          'basic/types/ArbNumber',
          'basic/types/String',
          'basic/types/SemEntity',
          'load/parser/SemEntityParser',
          'load/parser/SimpleDateParser',
          'util/requirePromise'
        ],
function( DataStore,
          Constants,
          Dataset,
          ArbNumber,
          StringType,
          SemEntity,
          SemEntityFactory,
          DateFactory,
          requireP
        ){

  /**
   * parse a given string using the given parser
   */
  return async function Loader( module, content, settings, parserDef ) {

    // prepare parser
    const parser      = [],
          datatypes   = [],
          semEntities = [];
    for( var i=0; i<parserDef.length; i++ ) {
      switch( parserDef[i].name ) {

        case ArbNumber.prototype['_type']:
          parser.push( ArbNumber );
          datatypes.push( Constants.DATATYPE.NUMERIC );
          break;

        case StringType.prototype['_type']:
          parser.push( StringType );
          datatypes.push( Constants.DATATYPE.STRING );
          break;

        case 'TimeInstant':
          if( !('pattern' in parserDef[i]) ) {
            throw new Error( 'Missing parameter for time parser: pattern' );
          }
          if( !('meanings' in parserDef[i]) ) {
            throw new Error( 'Missing parameter for time parser: meanings' );
          }
          parser.push( DateFactory( parserDef[i].pattern, parserDef[i].meanings ) );
          datatypes.push( Constants.DATATYPE.TIME );
          break;
          
        case SemEntity.prototype['_type']:
          if( !('codelist' in parserDef[i]) ) {
            throw new Error( 'Missing parameter for semantic entity parser: codelist' );
          }
          const p = SemEntityFactory( parserDef[i].codelist );
          parser.push( p );
          datatypes.push( Constants.DATATYPE.SEMANTIC );
          semEntities.push( p );
          break;

        default: throw new Error( 'Unknown parser type: ' + parserDef[i].name );

      }
    }

    // load the respective module
    const loader = await requireP( 'load/loader/' + module );

    // load dataset
    const parserRes = await loader( content, parser, settings );

    // prepare dataset description
    const desc = {
      columns: [],
      parser:  parser,
    };
    for( let i=0; i<parserRes['parser'].length; i++ ) {
      desc['columns'].push({
        label:    parserRes['header'][i],
        role:     parser[i]['_type'] == 'ArbNumber' ? Constants.ROLE.MEAS : Constants.ROLE.DIM,
        concept:  null,
        order:    i + 1,
        datatype: datatypes[ i ],
      });
    }

    // convert all information to Dataset entry
    const entry = new Dataset( desc, parserRes['data'] );

    // add to Datastore
    const id = DataStore['addDataset']( entry );

    // populate metadata
    await Promise.all( semEntities.map( (el) => el.resolveURIs() ) );

    return {
      'data_id': id,
    };

  };

});
