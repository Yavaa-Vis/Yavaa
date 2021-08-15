/**
 * Provide access to the workflow objects
 * wrap answers up to match specified format
 */
"use strict";
define( [ 'util/requirePromise' ],
function( requireP ){

  return {
    'getWorkflow':  getWorkflow,
    'execWorkflow': execWorkflow,
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getWorkflow XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * retrieve a serialized version of the workflow
   * either as visualisation or as JSON string
   *
   * parameters
   * name       | type      | required  | desc
   * -------------------------------------------
   * data_id    | Number    | Y         | the respective dataset
   * format     | String    | Y         | format of the result: vis or json
   *
   * @param   {Object}  param
   * @returns {String}
   */
  async function getWorkflow( param ) {

    // require needed modules
    const [ DataStore, aggregateWorkflow ] = await requireP( ['store/data', 'workflow/aggregate' ] )

    // get corresponding workflow entry
    const baseEntry = DataStore.getDataset( param['data_id'] )['wfEntry'];

    // serialize workflow
    const wf = await aggregateWorkflow( baseEntry );

    // TODO correct serialization format

    // serialize wf data
    let serializedData;
    switch( param['format'].toUpperCase() ) {

      case 'JSON':  serializedData = JSON.stringify( wf );
                    break;

      case 'VIS':
      case 'VIZ':   const visualize = await requireP( 'workflow/visualize' );
                    serializedData  = visualize( wf, (typeof param.includeStyles != 'undefined') ? !!param.includeStyles : true );
                    break;

      default:    throw new Error( 'comm/workflow', 'Unknown serialization format: ' + param['format'] );

    }

    // forward result
    return {
      '_wfHints':{
        'noWFEntry': true
      },
      'action': 'workflow',
      'params': {
        'data_id':  param['data_id'],
        'format':   param['format'],
        'workflow': serializedData
      }
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX execWorkflow XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * execute the submitted workflow
   *
   * parameters
   * name       | type      | required  | desc
   * -------------------------------------------
   * wf_type    | String    | Y         | the type of the workflow to be executed: workflow or pwf
   * workflow   | String    | Y         | the actual JSON-encoded workflow
   *
   * @param   {Object}  param
   * @returns {String}
   */
  async function execWorkflow( param ) {

    // get type of workflow
    const wfType = param.wfType || 'workflow';

    // make sure it is one we know of
    if( ![ 'workflow', 'pwf' ].includes( wfType ) ) {
      throw new Error( 'comm/workflow', 'Unknown workflow type: ' + param['wfType'] );
    }

    // load needed parser
    const [ execute, parser ] = await requireP( [ 'workflow/execute', 'workflow/parser/' + wfType ] );

    // trigger execute and relay result
    const res = execute( param, parser );

    // return result
    return res;

  }

});