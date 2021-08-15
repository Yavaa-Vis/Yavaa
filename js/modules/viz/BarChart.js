"use strict";
/**
 * Defines an object to produce bar charts
 */

define( [ 'store/data',
          'viz/BarChart.desc',
          'viz/BarChart.plot',
          'text!template/viz/BarChart.tpl.css',
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
   *  yaxis       | Number|Array[Number]  | ID(s) of the column(s) to be mapped on the y-axis
   *  mult        | *Number               | ID of the column by which to partition the dataset
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
    const yTitle = (param['yaxis'] instanceof Array) ? '' : cols[ param['yaxis'] ].getLabel();

    // augment with default parameters
    source.findDistinctValues();
    const usedParam = Object.assign( {
                              'id':       ('BarChart' + Date.now()),
                              'width':    960,
                              'height':   500,
                              'title':{
                                'yaxis':  yTitle,
                              },
                              '_domains': cols.map( (c) => c && c.getDistinctValues() ),
                            }, param, {
                              '_legend':  (typeof param.mult != 'undefined') ? 0 : undefined,
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
          cols     = source.getColumnMeta(),
          srcData  = source.getData(),
          rowCount = source.getRowCount();

    // shortcuts
    const xaxis = srcData[ param.xaxis ],
          yaxis = srcData[ param.yaxis ],
          mult  = Number.isInteger( param.mult ) ? srcData[ param.mult ] : '';

    // collect data per column set
    const collections = [],
          lookup      = {};
    for( let i=0; i<rowCount; i++ ) {

      // category (== mult of lines)
      const cat = mult instanceof Array ? mult[i] : mult;

      // get value collection
      if( !(cat in lookup) ) {
        lookup[ cat ] = { label: cat, values: [] };
        collections.push( lookup[ cat ] );
      }
      const coll = lookup[ cat ];

      // add value
      coll.values
          .push({
            x: xaxis[i],
            y: yaxis[i],
            label: cat,
          });

    }

    return {
      entries:  collections,
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});