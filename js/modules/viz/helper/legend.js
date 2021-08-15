"use strict";
/**
 * create a legend at the given container
 *
 */
define( [ 'util/requirePromise' ], function( requireP ){

  return async function legend( document, d3, id, width, scale ){

    // load legend plotter
    let plotter;
    switch( getScaleType( d3, scale) ) {

      case d3.scaleSequential: plotter = await requireP( 'viz/helper/colorRangeLegend' );
                               break;

      case d3.scaleOrdinal: plotter = await requireP( 'viz/helper/colorLegend' );
                            break;

      default: throw Error( 'Unsupported scale.' );
    }

    // add legend
    return plotter( document, d3, id, width, scale );

  };


  /**
   * rough hack to determine the type of scale
   *
   * currently supported:
   * - d3.scaleOrdinal()
   * - d3.scaleSequential()
   */
  function getScaleType( d3, scale ) {

    if( 'interpolator' in scale ) {
      return d3.scaleSequential;
    } else {
      return d3.scaleOrdinal;
    }

  }

});