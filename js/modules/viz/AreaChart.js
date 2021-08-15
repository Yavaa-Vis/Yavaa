"use strict";
/**
 * Defines an object to produce area charts
 */

define( [ 'basic/Constants',
          'store/data',
          'viz/AreaChart.desc',
          'viz/AreaChart.plot',
          'comp/partitionDataset',
          'serializer/JSON.KeyValue',
          'text!template/viz/AreaChart.tpl.css',
], function( Constants,
             DataStore,
             Desc,
             Plotter,
             Partition,
             Serializer,
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
   *  yaxis       | Number|Array[Number]  | ID(s) of the column(s) to be mapped on the y-axis
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

    // y-axis title
    const yTitle = cols[ param['yaxis'] ].getLabel();

    // augment with default parameters
    const usedParam = Object.assign( {
                              'id':       ('AreaChart' + Date.now()),
                              'width':    960,
                              'height':   500,
                              'title':{
                                'yaxis':  yTitle,
                              },
                              '_domains': cols.map( (c) => c && c.getDistinctValues() ),
                              'isTimeAxis': Constants.DATATYPE.TIME == cols[ param['xaxis'] ].getDatatype(),
                            }, param );

    // set the ID to the SVG element, if needed
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
          cols     = source.getColumnMeta(),
          srcData  = source.getData(),
          rowCount = source.getRowCount();

    // collect data
    const data = [];
    for( let row=0; row<rowCount; row++ ) {

      data.push({
        'd': srcData[ param.xaxis ][row].toJSON(),
        'v': srcData[ param.yaxis ][row].valueOf()
      });

    }

    // return result
    return data;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});