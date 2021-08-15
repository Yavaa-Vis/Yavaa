"use strict";
/**
 * Defines an object to produce a Heatmap (categorical)
 */

define( [ 'store/data',
          'viz/HeatmapCat.desc',
          'viz/HeatmapCat.plot',
          'text!template/viz/HeatmapCat.tpl.css',
], function( DataStore,
             Desc,
             Plotter,
             CSS
){


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Public Functions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * create static SVG code
   * this includes the actual data
   *
   * param        | type                  | desc
   * --------------------------------------------------------------------------
   *  data_id     | Number                | ID of the dataset to visualize
   *  xaxis       | Number                | ID of the column to be mapped on the x-axis
   *  yaxis       | Number                | ID of the column to be mapped on the y-axis
   *  value       | Number                | ID of the measurement column
   *  width       | Number                | Width of the resulting image
   *  height      | Number                | Height of the resulting image
   *  id          | String                | ID of the resulting SVG-tag
   */
  async function getStaticSVG( document, d3, param ) {

    // get data
    const data = await prepareData( param );

    // grab the meta data
    const source = DataStore.getDataset( param['data_id'] ),
          cols   = source.getColumnMeta();

    // titles
    const yTitle = (param['yaxis'] instanceof Array) ? '' : cols[ param['yaxis'] ].getLabel(),
          xTitle = (param['xaxis'] instanceof Array) ? '' : cols[ param['xaxis'] ].getLabel();

    // augment with default parameters
    source.findDistinctValues();
    const usedParam = Object.assign({
                              'id':       ('HeatmapCat' + Date.now()),
                              'width':    960,
                              'height':   500,
                              'title':{
                                'yaxis':  yTitle,
                                'xaxis':  xTitle,
                              },
                              '_domains': cols.map( (c) => c && c.getDistinctValues() ),
                            }, param, {
                              '_legend':  (typeof param.value != 'undefined') ? 0 : undefined,
                            });

    // set the ID to the svg element, if needed
    const cont = document.querySelector( '#' + usedParam.id );
    if( !cont ) {
      d3.select( document ).select( 'svg' ).attr( 'id', usedParam.id );
    }

    // plot chart
    Plotter( document, d3, data, usedParam );

    // add CSS
    const css = CSS.replace( /{id}/gi, usedParam.id );
    document.querySelector( 'style' )
      .appendChild( document.createTextNode( `/* <![CDATA[ */${css}/* ]]> */` ) );

    // return code
    return usedParam;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Private Functions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  /**
   * prepare the data to be included in a visualisation
   */
  async function prepareData( param ) {

    // get source data
    const source   = DataStore.getDataset( param.data_id ),
          srcData  = source.getData(),
          rowCount = source.getRowCount();

    // shortcuts
    const xaxis     = srcData[ param.xaxis ],
          yaxis     = srcData[ param.yaxis ],
          vcol      = srcData[ param.value ];

    // collect data per column set
    const result = [];
    for( let i=0; i<rowCount; i++ ) {

      // add value
      result.push({
            x: xaxis[i],
            y: yaxis[i],
            v: vcol[i],
          });

    }

    return {
      values: result,
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});