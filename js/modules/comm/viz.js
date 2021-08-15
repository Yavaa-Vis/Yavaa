/**
 * Provide access to the visualisation objects
 * wrap answers up to match specified format
 */
"use strict";
define( [ 'util/requirePromise' ],
function(  requireP ){

  return {
    'getStaticSVG'       : getStaticSVG,
    'suggestViz'         : suggestViz
  };


  /**
   * create a list of suggested visualizations
   *
   * parameters
   * name       | type      | required  | desc
   * -------------------------------------------
   * data_id    | Number    | Y         | the dataset to visualize
   */
  async function suggestViz( param ) {

    // load dependencies
    const [ Datastore, suggestApprox ] = await requireP( [ 'store/data', 'store/viz/suggestApprox'] )

    // grab respective dataset
    const ds = Datastore.getDataset( param['data_id'] );

    // make sure, we have a dataset
    if( !ds ) {
      throw new Error( 'Unknown data id: ' + param['data_id'] );
    }

    // get suggestion
    const { suggestion, omittedCols } = await suggestApprox( ds );

    // relay result
    return {
      'action': 'vizSuggestions',
      'params': {
        'sugg':     suggestion,
        'omitted':  omittedCols,
        'data_id':  param['data_id']
      }
    };

  }

  /**
   * return a static SVG representation of the given dataset
   *
   * parameters
   * name       | type      | required  | desc
   * -------------------------------------------
   * data_id    | Number    | Y         | the dataset to visualize
   * type       | String    | Y         | the type of the visualization
   * options    | Object    | Y         | visualization specification
   *
   */
  async function getStaticSVG( param ) {

    // check param for validity
    const VizRepo = await requireP( 'viz/RepoList' ),
          valid   = VizRepo.some( entry => entry[0] == param['type'] );
    if( !valid ){
      throw new Error( `Unknown visualization type: ${param.type}` );
    }

    // get chart creation lib
    const Chart = await requireP( 'viz/' + param['type'] );

    // get JSDOM
    let JSDOM;
    if( requirejs.isBrowser ) {

      // browser environment
      // TODO add browserified version of JSDOM
      throw new Error( 'Not implemented' );

    } else {

      // load NodeJS jsdom
      JSDOM = require( 'jsdom' ).JSDOM;

    }

    // load d3 and the wrapper
    const [ d3, wrapper ] = await requireP( [ 'd3',
                                              'text!template/viz/General.d3.tpl.htm' ] );

    // create a new DOM instance and add d3
    // TODO there needs to be some better way to add d3 here
    const jsdom = new JSDOM( wrapper, { runScripts: "outside-only" } );

    // augment options with some data
    param['options']['data_id'] = param['data_id'];

    // insert the chart into the DOM
    await Chart.getStaticSVG( jsdom.window.document, d3, param['options'] );

    // remove the additional data
    delete param['options']['data_id'];

    // done
    return {
      'action': 'viz',
      'params': {
        'data_id':  param['data_id'],
        'code':     jsdom.window.document.querySelector( 'svg' ).outerHTML,
        'type':     'staticSVG'
      }
    };

  }

});