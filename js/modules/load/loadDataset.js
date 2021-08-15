/**
 * Trigger the loading of a dataset
 * - ask in metadata-store for dataset's metadata
 * - load file
 * - relay file contents to respective loader
 */
"use strict";
define( [ 'store/data',
          'basic/types/Dataset',
          'store/metadata',
          'load/parser/SemEntityParser',
          'load/parser/SimpleDateParser',
          'basic/types/ArbNumber',
          'util/requirePromise'
        ],
function( DataStore,
          Dataset,
          metadataStore,
          SemEntityFactory,
          DateFactory,
          ArbNumber,
          requireP
        ){

  // regex to validate dataset URIs
  // for now, they all share the same format
  const isURIvalidator = /^http:\/\/yavaa\.org\/ns\/eurostat\/dsd#[a-zA-Z0-9_]*$/;

  /**
   * all in one loader to be called from frontend
   */
  return async function Loader( dataset_id ) {

    // check, if we got a valid dataset ID
    const isURI = isURIvalidator.test( dataset_id );
    if( !isURI ) {
      // we did not get an URI, so we need to find the corresponding URI
      // TODO replace this hack by something appropriate
      dataset_id = 'http://yavaa.org/ns/eurostat/dsd#' + dataset_id.replace( /[^a-zA-Z0-9_]/g, '' );
    }

    // see, if this is a valid dataset ID
    // valid datasets have a name ...
    const names = await metadataStore.resolveName( dataset_id );
    if( names[ dataset_id ] == dataset_id ) {
      return {
        'data_id': -1
      };
    }

    // collect all necessary metadata
    const [ metadata, distr, cols ] = await Promise.all([
                 metadataStore['getMetadata']( dataset_id ),
                 metadataStore['getDistributions']( dataset_id ),
                 metadataStore['getColumns']( dataset_id )
               ]);

    // convert some metdata
    metadata[ 'publisher' ] = metadata[ 'http://purl.org/dc/terms/publisher' ][ 0 ];
    metadata[ 'title' ]     = metadata[ 'http://purl.org/dc/terms/title' ][ 0 ];

    // store general data
    const datasetDesc = {
        'metadata':   metadata,
        'distr':      distr,
        'columns':    cols,
        'types':      {},
        'parser':     []
    };

    // for time types, we need some more info
    let reqs = [];
    for(let col of cols ){
      if( col && ('time' in col) ) {
        reqs.push( metadataStore['resolveTimeType']( col['time'] ) );
      }
    }

    // wait for all time type requests
    const types = await Promise.all( reqs );

    // add time type entries to description
    for( let type of types ) {
      Object.keys( type )
            .forEach( (key) => datasetDesc[ 'types' ][ key ] = type[ key ] );
    }

    // choose distribution to load from and do loader specific preparations
    // TODO
    const [ loader, RemoteFile, GZHandler ]
            = await requireP([ 'load/loader/eurostat.tsv',
                               'load/RemoteFile',
                               'load/GZHandler' ])

    // get and save TSV distribution to be used here
    Object.keys( datasetDesc['distr'] )
          .forEach( (key) => {
            if( key.substr( -4 ) == '_tsv' ) {
              datasetDesc['distrUsed'] = datasetDesc['distr'][ key ];
              datasetDesc['distrUsed']['id'] = key;
            }
          });

    // return loader
    const load = function load( url ) {

      // prepare handler
      const unzip    = new GZHandler(),
            resource = new RemoteFile( url );

      // load data
      return resource
              .pipe( unzip )
              .getContents()
              .then( function( content ){
                return loader( content, datasetDesc['parser'] );
              });
    }

    // prepare entry parsers
    let p, t,
        dscols      = datasetDesc['columns'],
        dstypes     = datasetDesc['types'],
        semEntities = [];
    for( const col of dscols ) {

      // skip the first empty column
      if( !col ) {
        continue;
      }

      switch( true ) {

        case ('time' in col):
          // get type information
          t = dstypes[ col['time'] ];
          if( t ) {
            // create parser
            p = DateFactory( t['pattern'], t['meanings'] );
            datasetDesc['parser'].push( p );

          } else{

            // no type information
            datasetDesc['parser'].push( null );

          }
          break;

        case ('numeric' in col ):
          datasetDesc['parser'].push( ArbNumber );
          break;

        case ('codelist' in col ):
          p = SemEntityFactory( col.codelist );
          semEntities.push( p );
          datasetDesc['parser'].push( p );
          break;

        default: datasetDesc['parser'].push( null );

      }
    }

    // trigger parsing process
    const parserRes = await load( datasetDesc['distrUsed']['url'][0] );

    // add used parser to desc
    for( var i=1; i<=parserRes['parser'].length; i++ ) {
      datasetDesc['columns'][i]['constr'] = parserRes['parser'][i-1];
    }

    // remove first empty column
    datasetDesc['columns'].shift();

    // remove some properties from datasetDescr that are no longer needed
    delete datasetDesc['parser'];

    // convert all information to Dataset entry
    const entry = new Dataset( datasetDesc, parserRes['data'] );

    // add to Datastore
    const id = DataStore['addDataset']( entry );

    // populate metadata
    await Promise.all([
      entry.populateMeta(),
      ... semEntities.map( (el) => el.resolveURIs() )
    ]);

    // resolve result
    return {
      'data_id': id
    };

  };

});