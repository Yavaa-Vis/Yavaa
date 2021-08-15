"use strict";
define( [ 'ui/basic/Yavaa.global',
          'util/requirePromise'],
function( Y,
          requireP
){

  /*
   * Collect some common tasks
   */

  /**
   * @constructor
   */
  const CmdBroker = {};

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX addDataset XXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  CmdBroker.loadDataset = async function( ds_id ){

    // we need the Dataset type
    const Dataset = await requireP( 'ui/basic/types/Dataset' );

    // request loading from engine
    const cmd = {
        'action': 'loadData',
        'params': { 'id': ds_id }
     };
    const msg = await Y.CommBroker.execCommand( cmd );

    // did the loading succeed?
    if( msg.params.data_id < 0 ) {
      return false;
    }

    // create respective dataset
    const ds = new Dataset( msg.params.data_id, 'data', cmd );

    // add dataset
    Y.UIBroker.addDataset( ds );

    // show in content view
    Y.UIBroker.showView( ds, 'data' );

    return true;

  };


  CmdBroker.loadFile = async function( module, content, settings, parser ){

    // we need the Dataset type
    const Dataset = await requireP( 'ui/basic/types/Dataset' );

    // request loading from engine
    const msg = await Y.CommBroker
                       .execCommand({
                          'action': 'loadFile',
                          'params': {
                            'module':   module,
                            'content':  content,
                            'settings': settings,
                            'parser':   parser
                          }
                        });

    // create respective dataset
    // empty command as this can get fairly large and should not be stored in the history
    const ds = new Dataset( msg.params.data_id, 'data', null );

    // add dataset
    Y.UIBroker.addDataset( ds );

    // show in content view
    Y.UIBroker.showView( ds, 'data' );

  };


  // attach to global object
  Y.CmdBroker = CmdBroker;

});