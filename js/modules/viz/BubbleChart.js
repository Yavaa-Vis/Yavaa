"use strict";
/**
 * Defines an object to produce a BubbleChart
 */

define( [ 'store/data',
          'viz/BubbleChart.desc',
          'viz/BubbleChart.plot',
          'text!template/viz/BubbleChart.tpl.css',
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
   *  name        | Number                | ID of the column to provide the name
   *  size        | Number                | ID of the column to provide the size
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

    // augment with default parameters
    source.findDistinctValues();
    const usedParam = Object.assign({
                              'id':       ('BubbleChart' + Date.now()),
                              'width':    960,
                              'height':   500,
                              '_domains': cols.map( (c) => c && c.getDistinctValues() ),
                            }, param );

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
    const namecol = srcData[ param.name ],
          sizecol = srcData[ param.size ];

    // collect data per column set
    const result = [];
    for( let i=0; i<rowCount; i++ ) {

      // add value
      result.push( {
            n: namecol[i],
            s: sizecol[i],
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