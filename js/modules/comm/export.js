"use strict";
/**
 *
 * access to the exporter mechanisms
 *
 */
define( [ 'store/data',
          'util/requirePromise',
        ],
function( Datastore,
          requireP
        ){

  return {
    'export': exporter
  };


  /**
   * create a dataset by parsing the given file and settings
   *
   * parameters
   * name       | type      | required  | desc
   * -------------------------------------------
   * data_id    | Number    | Y         | the dataset to export
   * part       | String    | Y         | the part of the dataset to export: ds, wf, vis
   * mime       | String    | Y         | the MIME-type of the export; see ui/dialog/export.html
   * visoptions | Object    | N         | visualization specification, if part == vis
   */
  async function exporter( param ) {

    // validate inputs
    if ( ![ 'ds', 'wf', 'vis', 'viz' ].includes( param.part ) ) {
      throw new Error( `Unknown part requested: ${param.part}` );
    }
    if ( ![ 'text/tab-separated-values',
            'application/json',
            'image/svg+xml' ].includes( param.mime ) ) {
      throw new Error( `Unknown MIME-type requested: ${param.mime}` );
    }

    // get the dataset
    var ds = Datastore.getDataset( param['data_id'] );

    // get content
    let content;
    switch( param.part ) {

      /* ----------------------------- dataset ----------------------------- */
      case 'ds':
        // get the serializer
        let serializer;
        switch( param.mime ) {
          case 'text/tab-separated-values': serializer = await requireP('export/dsv'); break;
        }

        // serialize the dataset
        if( serializer ){
          content = await serializer( ds );
        }
        break;

      /* ----------------------------- workflow ---------------------------- */
      case 'wf':
        // format
        const format = param.mime == 'image/svg+xml' ? 'vis' : 'json';

        // relay this to other function
        const commWf = await requireP( 'comm/workflow'),
              resWf  = await commWf.getWorkflow({ data_id: param['data_id'], format: format });

        // extract the relevant result
        content = resWf.params.workflow;
        break;

      /* -------------------------- visualization -------------------------- */
      case 'vis':
      case 'viz':
        // settings need to be present
        if( !('visoptions' in param) ) {
          throw new Error( 'Missing visualization specification!' );
        }

        // relay to other function
        const commViz = await requireP( 'comm/viz' ),
              resViz = await commViz.getStaticSVG({ data_id: param['data_id'],
                                                    options: param['visoptions']['options'],
                                                    type:    param['visoptions']['type'] });

        // extract the relevant result
        // for correct syntax we need to prepend the xml tag
        content = '<?xml version="1.0" encoding="UTF-8"?>' + resViz.params.code;
        break;

    }

    // error on invalid combinations of part and mime
    if( !content ){
      throw new Error( `Unknown combination requested: ${param.part} and ${param.mime}` );
    }

    // return
    return {
      '_wfHints':{
        'noWFEntry': true
      },
      'action':   'exported',
      'params': {
        'data_id': param['data_id'],
        'part':    param['part'],
        'mime':    param['mime'],
        'data':    content,
      }
    };

  }

});