"use strict";
/**
 * Defines an object to produce a matrix layout
 */

define( [ 'store/data',
          'viz/Matrix.desc',
          'viz/Matrix.plot',
          'comp/partitionDataset',
          'util/requirePromise',
          'text!template/viz/Matrix.tpl.css',
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
   *  cols        | Number                | ID of the column to be mapped on the columns (x-axis)
   *  rows        | Number                | ID of the column to be mapped on the rows (y-axis)
   *  viz         | String                | Name of the nested visualization
   *  width       | Number                | Width of the resulting image
   *  height      | Number                | Height of the resulting image
   *  id          | String                | ID of the resulting SVG-tag
   */
  async function getStaticSVG( document, d3, param ) {

    // augment with default parameters
    const usedParam = Object.assign( {
                              'id':       ('Rows' + Date.now()),
                              'width':    960,
                              'height':   500,
                            }, param );

    // load nested visualization
    const [ nested, nestedDesc ] = await requireP(  [ 'viz/' + param.viz, 'viz/' + param.viz + '.desc' ] );

    // get a list of column ids from the nested visualization
    const nestedColIds = new Set();
    for( let binding of nestedDesc ) {
      for( let col of binding.columnBinding ) {
        nestedColIds.add( col.id );
      }
    }

    // get data
    const data = await prepareData( usedParam, nestedColIds );

    // grab the meta data
    const source = DataStore.getDataset( param['data_id'] ),
          cols   = source.getColumnMeta();

    // get a list of distinct values for all columns
    // used as domain in the visualization
    source.findDistinctValues();
    usedParam._domains = cols.map( (c) => c && c.getDistinctValues() );

    // set the ID to the svg element
    d3.select( document ).select( 'svg' ).attr( 'id', usedParam.id );

    // plot layout
    Plotter( document, d3, data, usedParam );

    // adapt width/height for nested viz (so one can see at least some of the texts)
    const widthRatio  = usedParam.width  / usedParam._nested.width,
          heightRatio = usedParam.height / usedParam._nested.height;
    let nestedHeight, nestedWidth;
    if( widthRatio > heightRatio ) {
      // height is limiting
      nestedHeight = usedParam.height * ( 1 - 1 / usedParam._domains[ param.rows ].list.length );
      nestedWidth  = Math.round( usedParam._nested.width * nestedHeight / usedParam._nested.height );
    } else {
      // width is limiting
      nestedWidth  = usedParam.width * ( 1 - 1 / usedParam._domains[ param.cols ].list.length );
      nestedHeight = Math.round( usedParam._nested.height * nestedWidth / usedParam._nested.width );
    }

    // remove rows/cols distinct values from _domains
    usedParam._domains = usedParam._domains.filter( (el,i) => (i != param.rows) && (i != param.cols) );

    // insert the nested visualization
    let returnParam = {}
    for( let nestedSection of usedParam._nested.ids ) {

      // get the respecte data id
      const nestedDataId = data.entries.get( nestedSection.row ).get( nestedSection.col );

      // skip empty sections
      if( typeof nestedDataId == 'undefined' ) {
        continue;
      }

      // base param object
      const nestedParam = Object.assign( {}, usedParam, {
                                  id:       nestedSection.id,
                                  width:    nestedWidth,
                                  height:   nestedHeight,
                                  data_id:  nestedDataId,
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

      // get the respective scale
      const scale = returnParam._scales[ returnParam._legend ];

      // load legend plotter
      const legend = await requireP( 'viz/helper/legend' );

      // add legend
      const legendHeight = await legend( document, d3, '#legend', usedParam.width, scale );

      // adjust overall SVG height
      const cont    = d3.select( document ).select( `#${usedParam.id}` ),
            viewBox = cont.attr( 'viewBox' ).split( ' ' );
      viewBox[3] = parseFloat( viewBox[3] ) + legendHeight;
      cont.attr( 'viewBox', viewBox.join( ' ' ) );

    }

    // return code
    return usedParam;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Private Functions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * prepare the data to be included in a visualisation
   */
  async function prepareData( param, nestedColIds ) {

    // partition data into rows
    let partDatasets = await Partition.partition({
                                          'data_id':  param['data_id'],
                                          'partCols': [ param['rows'] ]
                                        });

    // sort results
    partDatasets = partDatasets.sort( (a,b) => a.fixedCol[0].value.compare( b.fixedCol[0].value ) );

    // adjust columns ids, if necessary; rows edition
    nestedColIds
      .forEach( (id) => {
        if( param[ id ] instanceof Array ) {
          param[ id ] = param[ id ].map( (v) => (param.rows < v) ? v - 1 : v );
        } else {
          param[ id ] = (param.rows < param[ id ])
                              ? param[ id ] - 1
                              : param[ id ];
        }
      });

    // partition data into columns
    const partitions = new Map(),
          colDomain = new Set();
    for( let lvl1Ds of partDatasets ) {

      // partition
      const partLvl2 = await Partition.partition({
                              'data_id':  lvl1Ds.data_id,
                              'partCols': [ param['cols'] ]
                            });

      // add to result
      const map = partLvl2.reduce( (all, p) => all.set( p.fixedCol[0].value, p.data_id ), new Map() )
      partitions.set( lvl1Ds.fixedCol[0].value, map );
      partLvl2.forEach( p => colDomain.add( p.fixedCol[0].value ) );

    }

    // adjust columns ids, if necessary; columns edition
    nestedColIds
      .forEach( (id) => {
        if( param[ id ] instanceof Array ) {
          param[ id ] = param[ id ].map( (v) => (param.cols < v) ? v - 1 : v );
        } else {
          param[ id ] = (param.cols < param[ id ])
                              ? param[ id ] - 1
                              : param[ id ];
        }
      });

    return {
      domain: {
        rows: [ ... partitions.keys() ].sort(),
        cols: [ ... colDomain ].sort(),
      },
      entries:  partitions,
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});