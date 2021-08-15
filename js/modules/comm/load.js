"use strict";
/**
 *
 * access to the loader mechanisms
 *
 */
define( [ 'util/requirePromise' ],
function(  requireP  ){

  return {
    'loadFile': loadFile,
    'loadData': loadData
  };


  /**
   * create a dataset by parsing the given file and settings
   */
  async function loadFile( param ) {

    // load module
    const loadFileModule = await requireP( 'load/loadFile' );

    // execute loader
    const parseResult = await loadFileModule( param['module'], param['content'], param['settings'], param['parser'] );

    // relay result
    return {
      'action':   'done',
      'params': {
        'data_id': parseResult['data_id']
      }
    };

  }


  /**
   * load a dataset from the given id
   */
  async function loadData( param ) {

    // load module
    const loadDataset = await requireP( 'load/loadDataset' );

    // load the dataset
    const parseResult = await loadDataset( param['id'] );

    // relay answer
    return {
      'action':   'done',
      'params': {
        'data_id': parseResult['data_id']
      }
    };

  }

});