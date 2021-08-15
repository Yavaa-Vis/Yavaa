"use strict";
/**
 * Defines an object to produce boxplot charts
 *
 *
 * param        | type                  | desc
 * --------------------------------------------------------------------------
 *  data_id     | Number                | ID of the dataset to visualize
 *  cat         | Number                | ID of the column used for categorization
 *  val         | Number                | ID of the column containing the measurements
 *  width       | Number                | Width of the resulting image
 *  height      | Number                | Height of the resulting image
 *  id          | String                | ID of the resulting SVG-tag
 *  classes     | *String || *Array     | classes to attach to the elements, which represent data
 *  dataAttr    | *String               | ID of the column, whose value to put in data-yavaa
 */

define( [ 'store/data',
          'viz/Boxplot.desc',
          'viz/Boxplot.plot',
          'comp/aggregate',
          'comp/stats/getQuantiles',
          'text!template/viz/BoxPlot.tpl.css',
], function( DataStore,
             Desc,
             Plotter,
             aggregate,
             getQuantiles,
             CSS
){

  // shortcut
  aggregate = aggregate.aggregate;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Public Functions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * create static SVG code
   * this includes the actual data
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
                              'id':       ('Boxplot' + Date.now()),
                              'width':    960,
                              'height':   500,
                              'title':{
                                'yaxis':  cols[ param['val'] ].getLabel()
                              },
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

    // get dataset
    const sourceDs = DataStore.getDataset( param.data_id );

    // group by "cat" column
    const data_id = await aggregate( sourceDs, [ param.cat ] )

    // get (grouped) dataset
    const ds    = DataStore.getDataset( data_id ),
          data  = ds.getData();

    // get count of entries
    const entryCount = data[0].length;

    // prep result
    const result = [];

    // process each row
    for( let i=0; i<entryCount; i++ ) {

      // get label
      const label = data[ param.cat ][ i ];

      // get values
      const values = data[ param.val ][ i ].getValues();

      // compute quartiles
      const quartiles = getQuantiles( values, 4 );

      // add to result
      result.push({
        name:   label,
        values: quartiles.map( (v) => parseFloat( v ) )
      });

    }

    // pass data on
    return result;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});