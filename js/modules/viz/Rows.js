"use strict";
/**
 * Defines an object to produce a row-based layout
 */

define( [ 'store/data',
          'viz/Rows.desc',
          'viz/Rows.plot',
          'comp/partitionDataset',
          'util/requirePromise',
          'text!template/viz/Rows.tpl.css',
], function( DataStore,
             Desc,
             Plotter,
             Partition,
             requireP,
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
   *  rows        | Number                | ID of the column to be mapped on the rows (y-axis)
   *  viz         | String                | Name of the nested visualization
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

    // get a list of distinct values for all columns
    // used as domain in the visualization
    // remove the column, that is used for row separation
    source.findDistinctValues();
    const domains = cols.map( (c) => c && c.getDistinctValues() )
                        .filter( (c,i) => i != param.rows );

    // augment with default parameters
    const usedParam = Object.assign( {
                              'id':       ('Rows' + Date.now()),
                              'width':    960,
                              'height':   500,
                              _domains:   domains,
                            }, param );

    // set the ID to the svg element
    d3.select( document ).select( 'svg' ).attr( 'id', usedParam.id );

    // plot layout
    Plotter( document, d3, data, usedParam );

    // load nested visualization
    const [ nested, nestedDesc ] = await requireP(  [ 'viz/' + param.viz, 'viz/' + param.viz + '.desc' ] );

    // we might need to adjust some column ids
    const nestedColIds = new Set();
    for( let binding of nestedDesc ) {
      for( let col of binding.columnBinding ) {
        nestedColIds.add( col.id );
      }
    }
    nestedColIds
      .forEach( (id) => {
        if( usedParam[ id ] instanceof Array ) {
          usedParam[ id ] = usedParam[ id ].map( (v) => (param.rows < v) ? v - 1 : v );
        } else {
          usedParam[ id ] = (param.rows < usedParam[ id ])
                              ? usedParam[ id ] - 1
                              : usedParam[ id ];
        }
      });

    // adapt width/height for nested viz (so one can see at least some of the texts)
    const nestedHeight = usedParam.height * ( 1 - 1 / nestedColIds.size ),
          nestedWidth  = Math.round( usedParam._nested.width * nestedHeight / usedParam._nested.height );

    // insert the nested visualization
    let returnParam = {}
    for( let i=0; i<data.entries.length; i++ ) {

      // base param object
      const nestedParam = Object.assign( {}, usedParam, {
                                  id:       usedParam._nested.ids[ i ],
                                  width:    nestedWidth,
                                  height:   nestedHeight,
                                  data_id:  data.entries[ i ],
                                }, {
                                  _hideLegend: true,
                                  _scales:  returnParam._scales,
                                });

      returnParam = await nested.getStaticSVG( document, d3, nestedParam );

    }

    // add CSS
    const css = CSS.replace( /{id}/gi, usedParam.id );
    document.querySelector( 'style' )
            .appendChild( document.createTextNode( `/* <![CDATA[ */${css}/* ]]> */` ) );

    // plot legend, if requested
    if( ('_legend' in returnParam) && (typeof returnParam._legend == 'number' ) ) {

      // load legend plotter
      const legend = await requireP( 'viz/helper/legend' );

      // get the respective scale
      const scale = returnParam._scales[ returnParam._legend ];

      // add legend
      const legendHeight  = await legend( document, d3, '#legend', usedParam.width, scale );

      // adjust overall SVG height
      const cont    = d3.select( document ).select( `#${usedParam.id}` ),
            viewBox = cont.attr( 'viewBox' ).split( ' ' );
      viewBox[3] = parseFloat( viewBox[3] ) + legendHeight;
      cont.attr( 'viewBox', viewBox.join( ' ' ) );

    }

    // return code
    return true;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Private Functions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * prepare the data to be included in a visualisation
   */
  async function prepareData( param ) {

    // partition the data
    let partDatasets = await Partition.partition({
                                          'data_id':  param['data_id'],
                                          'partCols': [ param['rows'] ]
                                        });

    // sort results
    partDatasets = partDatasets.sort( (a,b) => a.fixedCol[0].value.compare( b.fixedCol[0].value ) );

    return {
      domain: {
        y:      partDatasets.map( p => p.fixedCol[0].value ),
      },
      entries:  partDatasets.map( p => p.data_id ),
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});