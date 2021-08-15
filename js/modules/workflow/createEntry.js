"use strict";
/*
 * gathers all information necessary to create a workflow entry
 * afterwards attaches it to the respective dataset
 */
define( [ 'store/data', 'workflow/Entry' ], function( DataStore, WFEntry ){

  // list of modules, that do _not_ create new datasets
  const excludedModules = [ 'comm/data', 'comm/info', 'comm/search', 'comm/workflow' ];

  /*
   *
   * returning "cols" object:
   * {
   *    former: 'id of the the respective column in the source dataset, that was the base for this column'
   *    basedOn: 'ids of the columns, that influenced the creation of this new column'
   * }
   */

  // TODO instead of using column indices, use ui/basic/types/Column to store wf info?

  function createEntry( command, result ){

    /*
     * cases:
     *
     * 1. loader: no previous entry available
     * 2. viz: no dataset as a result?
     * 3. comp/filter/...: previous entry available
     * 4. info operations: getMeta, getData, etc.
     */

    // get hints, if present
    const hints = result['_wfHints'];

    // some commands do not create a new dataset, hence do not create a workflow entry
    if(
          (hints && ('noWFEntry' in hints) && hints['noWFEntry'])     // explicit deny
       || (('params' in result) && !('data_id' in result['params']) ) // no (new) data_id
       || (excludedModules.indexOf( command['m'] ) >= 0)              // excluded modules
      ) {
      delete result['_wfHints'];
      return;
    }

    // create new workflow entry
    let entryData;
    switch( command['m'] ) {

      // loader
      case 'comm/load':         // loading failed
                                if( result['params']['data_id'] < 0 ) {
                                  return;
                                }

                                // else, create the entry
                                entryData = getLoaderInfo( command, result ); break;

      // visualisation
      case 'comm/viz':          entryData = getVizInfo( command, result ); break;

      // rest - should be computations
      default:
        switch( command['a'] ) {

          // joins
          case 'join':          entryData = getJoinInfo( command, result ); break;

          // default computation handler
          default:              entryData = getCompInfo( command, result );
        }

    }

    // attach common attributes
    entryData['endTime'] = Date.now();
    entryData['startTime'] = command['startTime'];
    if( 'data_id' in command['p'] ) {

      // add data_id to upper level
      entryData['_from_data_id'] = command['p']['data_id'];

      // remove data_id from lower level
      delete command['p']['data_id'];

      // reference to previous workflow entry
      if( !('_previous' in entryData ) ) {
        let ds = DataStore.getDataset( entryData['_from_data_id'] );
        entryData['_previous'] = ds['wfEntry'];
      }

    }

    // create workflow entry
    let entry = new WFEntry( entryData );

    if( entryData['type'] == 'viz' ) {

      // attach to viz
      // TODO


    } else {

      // attach to dataset
      let newDs = DataStore.getDataset( result['params']['data_id'] );
      newDs['wfEntry'] = entry;

    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Loader Info XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * @param     {Object}  command     the command that triggered the loading
   * @param     {Object}  result      the result
   * @returns   {Object}              the workflow entry
   */
  function getLoaderInfo( command, result ) {

    // get resulting dataset
    let ds = DataStore.getDataset( result['params']['data_id'] );

    // base info
    let wfEntry = {
        'type':   'load',
        'action': command['a'],
        'module': command['m'],
        'command': command['c'],
        'params': command['p'],
        'columns': []
    };

    // insert column data
    let cols = ds.getColumnMeta();
    for( let i=0; i<cols.length; i++ ) {

      // insert data
      wfEntry['columns'].push({
        'label':    cols[i].getLabel(),
        'order':    cols[i].getID(),
        'former':   null,
        'basedOn':  null
      });

    }

    // metadata
    let meta = ds.getMeta();

    // remove wfmeta from result
    delete result['_wfmeta'];

    // get ID of used distribution
    let distrUsed;
    if( 'distrUsed' in meta ) {
      distrUsed = meta['distrUsed'];
    }

    // add workflow data for dataset
    wfEntry['source'] = {
      'datasetId':  command['p']['id'],
      'url':        distrUsed ? distrUsed['url'][0] : null,
      'type':       distrUsed ? distrUsed['type'][0] : null,
      'publisher':  meta['dataset'][ 'publisher' ],
      'title':      meta['dataset'][ 'title' ]
    };

    return wfEntry;

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Comp Info XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * @param     {Object}  command     the command that triggered computation
   * @param     {Object}  result      the result
   * @returns   {Object}              the workflow entry
   */
  function getCompInfo( command, result ) {

    // get hints
    const hints = result['_wfHints'];
    delete result['_wfHints'];

    // get link to old dataset
    const oldDs   = DataStore.getDataset( command['p']['data_id'] ),
          oldCol  = oldDs ? oldDs.getColumnMeta() : [];

    // get link to new dataset
    const newDs = DataStore.getDataset( result['params']['data_id'] ),
          newCol = newDs.getColumnMeta();

    // try to derive a column mapping
    // i.e., find from which old column a specific column descended
    const colmapping = newCol.map( (col) => oldCol.findIndex( (c) => (c == col) || col.isDescendant( c ) ) );

    // create history entry for columns
    const cols = colmapping.map( (map, i) => {
      return {
        'former':   map,
        'basedOn':  null,
        'order':    i,
      };
    });

    // augment column history with data from hints, if possible
    if( hints && ('columns' in hints) ){
      const hCols = hints['columns'];
      for( let i=0; i<cols.length; i++ ) {

        // empty entry
        if( !hCols[i] ) {
          continue;
        }

        // values
        [ 'former', 'basedOn', 'label' ]
          .forEach( (key) => {
            if( key in hCols[i] ) {
              cols[i][key] = hCols[i][key];
            }
          });

      }
    }

    // return entry
    return {
      'type':     'comp',
      'action':   command['a'],
      'module':   command['m'],
      'command':  command['c'],
      'params':   command['p'],
      'columns':  cols
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Join Info XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * @param     {Object}  command     the command that triggered the join
   * @param     {Object}  result      the result
   * @returns   {Object}              the workflow entry
   */
  function getJoinInfo( command, result ) {

    /*
     * ids for columns:
     * base dataset:  stay the same as in source dataset
     * augm dataset:  get added an offset == baseDs.columns.length
     */

    // get hints
    let hints = result['_wfHints'];
    delete result['_wfHints'];

    // get links to (source) datasets and the respective column meta
    let baseDs = DataStore.getDataset( command['p']['data_id'] ),
        augmDs = DataStore.getDataset( command['p']['augm_data_id'] ),
        curDs  = DataStore.getDataset( result['params']['data_id'] ),
        baseCol = baseDs.getColumnMeta(),
        augmCol = augmDs.getColumnMeta(),
        curCol  = curDs.getColumnMeta();

    // get offset for augmenting dataset's columns
    let offset = baseCol.length;

    // make a list of columns involved in the join conditions (using offset)
    let joinCols = [],
        joinCond = command['p']['join_cond'];
    for( let i=0; i<joinCond.length; i++ ) {
      joinCols.push( joinCond[i][0] );          // from the base dataset
      joinCols.push( joinCond[i][1] + offset )  // from the augm dataset
    }

    // get column mapping
    let cols = [],
        fromBase = true;
    for( let i=0; i<curCol.length; i++ ) {

      // source
      let sourceID = -1;

      // we are still comparing to the base dataset
      if( fromBase ) {

        // column _positions_ here should be identical to the new dataset

        if( curCol[i].isDescendant( baseCol[i] ) ) {
          // found match in base dataset
          sourceID = baseCol[i].getID();
        } else {
          fromBase = false;
        }

      }

      // if we switched to the augm dataset ...
      if( !fromBase ){

        // column _ordering_ remains the same as in the new dataset

        for( let j=0; j<augmCol.length; j++ ) {
          if( curCol[i].isDescendant( augmCol[j] ) ) {
            sourceID = augmCol[j].getID() + offset; // ids from augm dataset have to be adjusted
            break;
          }
        }

      }

      // by now we (should) have a source

      // insert mapping entry
      cols.push({
        'former': sourceID,
        'basedOn': joinCols
      });

    }

    return {
      'type':     'join',
      'action':   command['a'],
      'module':   command['m'],
      'command':  command['c'],
      'params':   command['p'],
      'columns':  cols,
      '_previous': [ baseDs['wfEntry'], augmDs['wfEntry'] ]
    };
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Viz Info XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * @param     {Object}  command     the command that triggered this visualisation
   * @param     {Object}  result      the resulting visualisation
   * @returns   {Object}              the workflow entry
   */
  function getVizInfo( command, result ) {

    return {
      'type':     'viz',
      'action':   command['a'],
      'module':   command['m'],
      'command':  command['c'],
      'params':   command['p']
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  return createEntry;
});



/*

Column History Format:
======================

'former'      the column is the result of an operation on this column in the dataset before
'basedOn'     the operation on this column involved this columns of the dataset before
*'label'      the label from the source dataset (optional)
*'order'      the position in the order of the source dataset (optional)

*/