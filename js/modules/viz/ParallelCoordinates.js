"use strict";
/**
 * Defines an object to produce Parallel Coordinates charts
 *
 *
 * param        | type                  | desc
 * --------------------------------------------------------------------------
 *  data_id     | Number                | ID of the dataset to visualize
 *  color       | Number                | (optional) ID of column used for coloring
 *  ccol        | Array[Number]         | IDs of categorical (dim) columns to be visualized
 *  qcol        | Array[Number]         | IDs of quantitative (meas) columns to be visualized
 *  width       | Number                | Width of the resulting image
 *  height      | Number                | Height of the resulting image
 *  id          | String                | ID of the resulting SVG-tag
 *  classes     | *String || *Array     | classes to attach to the elements, which represent data
 */

define( [ 'store/data',
          'viz/ParallelCoordinates.desc',
          'viz/ParallelCoordinates.plot',
          'text!template/viz/ParallelCoordinates.tpl.css',
], function( DataStore,
             Desc,
             Plotter,
             CSS
){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Public Functions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * create static SVG code
   * this includes the actual data
   */
  async function getStaticSVG( document, d3, param ) {

    // we just need a single list of columns
    const colList = [];
    (param.dcol instanceof Array) ? colList.push( ... param.dcol ) : colList.push( param.dcol );
    (param.mcol instanceof Array) ? colList.push( ... param.mcol ) : colList.push( param.mcol );

    // column reorder function
    const columnReorder = reorderRow( param.color, colList );

    // get data
    const data = await prepareData( param, columnReorder );

    // grab the meta data
    const source = DataStore.getDataset( param['data_id'] ),
          cols   = columnReorder( source.getColumnMeta() );

    // get a list of distinct values for all columns
    // used as domain in the visualization
    let domains;
    if( '_domains' in param ) {
      domains = columnReorder( param._domains );
    } else {
      source.findDistinctValues();
      domains = cols.map( (c) => c && c.getDistinctValues() );
    }

    // get column titles; remove first as this is for the color
    const titles = cols.map( (c) => c && ('' + c.getLabel()).substring(0, 20) );
    titles.shift();

    // insert parameter to template
    const usedParam = Object.assign({
                              'id':       ('ParallelCoordinates' + Date.now()),
                              'width':    960,
                              'height':   500,
                              '_titles':  titles,
                            }, param, {
                              '_domains': domains,
                              '_legend':  (typeof param.color != 'undefined') ? 0 : undefined,
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
  async function prepareData( param, columnReorder ) {

    // get dataset
    const sourceDs = DataStore.getDataset( param.data_id );

    // convert to rows and reorder according to definition
    const result = sourceDs.getDataRows()
                           .map( columnReorder );

    // if a color is set, we split the data by that column
    if( ('color' in param) && (typeof param.color != 'undefined') ) {

      const clustered = new Map();
      for( const row of result ) {

        // get the color element
        const colorEl = row[ param.color ];

        // get the respective collection
        let collection;
        if( clustered.has( colorEl ) ){
          collection = clustered.get( colorEl );
        } else {
          collection = [];
          clustered.set( colorEl, collection );
        }

        // add the row
        collection.push( row );

      }

      // return clustered data
      return [ ... clustered.values() ];

    } else {

      // pass data on unclustered
      return [ result ];

    }

  }

  /**
   * create reorder function according to definition
   * first cell is color, if present
   * then ccol and qcol
   */
  function reorderRow( color, cols ) {
    const map = [ (typeof color != 'undefined') ? color : -1 ].concat( cols );
    return function( row ) {
      return map.map( (i) => row[i] );
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});