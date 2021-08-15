"use strict";
/**
 * Defines an object to produce sunburst charts
 *
 *
 * param        | type                  | desc
 * --------------------------------------------------------------------------
 *  data_id     | Number                | ID of the dataset to visualize
 *  hierarchy   | Number                | ID(s) of the column(s) to be mapped concentric circles
 *  size        | Number|Array[Number]  | ID of the column to be mapped on the size of the circle elements
 *  width       | Number                | Width of the resulting image
 *  height      | Number                | Height of the resulting image
 *  id          | String                | ID of the resulting SVG-tag
 *  classes     | *String || *Array     | classes to attach to the elements, which represent data
 *  dataAttr    | *String               | ID of the column, whose value to put in data-yavaa
 */

define( [ 'store/data',
          'viz/Sunburst.desc',
          'viz/Sunburst.plot',
          'comp/filterDataset',
          'serializer/JSON.KeyValue',
          'util/requirePromise',
          'text!template/viz/Sunburst.tpl.css',
],function( DataStore,
            Desc,
            Plotter,
            Filter,
            Serializer,
            requireP,
            CSS
){


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

    // make sure we have access to distinct values
    source.findDistinctValues();

    // augment with default parameters
    const usedParam = Object.assign({
                              'id':       ('Sunburst' + Date.now()),
                              'width':    500,
                              'height':   500,
                              '_domains': cols.map( (c) => c && c.getDistinctValues() ),
                            }, param, {
                              '_legend':  (typeof param.hierarchy != 'undefined') ? 0 : undefined,
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

    // TODO check input format

    // make sure the hierarchy is an array
    if( !(param.hierarchy instanceof Array) ) {
      param.hierarchy = [ param.hierarchy ];
    }

    // get source data
    let source    = DataStore.getDataset( param.data_id ),
        cols      = source.getColumnMeta(),
        srcData   = source.getData(),
        rowCount  = source.getRowCount(),
        hierarchy = param.hierarchy,
        value     = param.size;


    // init result data array
    const data = {
        'name':     'root',
        'map':      new Map(),
        'children': []
    };

    // walk through source data
    let hierarchyCount = hierarchy.length,
        runner,
        allEntries = [ data ],
        coloring;
    for( let row=0; row<rowCount; row++ ) {

      // reset runner
      runner = data;

      // label to determine coloring is given by name of innermost dimension
      coloring = '' + srcData[ hierarchy[0] ][ row ];

      // walk dimensions
      for( let dimIndex=0; dimIndex<hierarchyCount; dimIndex++ ) {

        // shortcut
        const el = srcData[ hierarchy[dimIndex] ][ row ];

        // if not present, add
        if( !runner.map.has( el ) ) {
          const newEntry = {
            'name':     '' + el,
            'coloring': coloring,
            'map':      new Map(),
            'children': []
          };
          runner.map.set( el, newEntry );
          runner.children.push( newEntry );
          allEntries.push( newEntry );
        }

        // keep on walking
        runner = runner.map.get( el );

      }

      // add the value
      runner.size = srcData[ value ][ row ];

    }

    // remove helper constructs
    allEntries.forEach( (el) => {

      // delete the map
      delete el.map;

      // if there are no children present, remove the property
      if( el.children.length < 1 ){
        delete el.children;
      }

    });

    // return result
    return data;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});