"use strict";
/**
 * Defines an object to produce line charts
 */

define( [ 'store/data',
          'viz/LineChart.desc',
          'viz/LineChart.plot',
          'comp/partitionDataset',
          'serializer/JSON.KeyValue',
          'text!template/viz/LineChart.tpl.css',
], function( DataStore,
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

    // make sure we have access to distinct values
    source.findDistinctValues();

    // y-axis title
    const yTitle = (param['yaxis'] instanceof Array) ? '' : cols[ param['yaxis'] ].getLabel();

    // augment with default parameters
    const usedParam = Object.assign( {
                              'id':       ('LineChart' + Date.now()),
                              'width':    960,
                              'height':   500,
                              'title':{
                                'yaxis':  yTitle,
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

    // (param.mult == undefined) !== (!'mult' in param))
    if( !('mult' in param ) || (param.mult === undefined) || (param.mult === null)) {

      /* ------------- multitude of lines is given by multiple columns ------------- */

      // TODO check input format

      // get source data
      const source   = DataStore.getDataset( param.data_id ),
            cols     = source.getColumnMeta(),
            srcData  = source.getData(),
            rowCount = source.getRowCount();

      // make sure yaxis holds an array
      if( !(param.yaxis instanceof Array) ) {
        param.yaxis = [ param.yaxis ];
      }

      // init result data array
      const data = [];
      for( let i=0; i<param.yaxis.length; i++ ) {
        data.push({
          'name':   cols[ param.yaxis[i] ].getLabel(),
          'values': []
        })
      }

      // walk through source data
      for( let row=0; row<rowCount; row++ ) {

        // every selected column ...
        for( let i=0; i<data.length; i++ ) {

          data[i]['values'].push({
            'd': srcData[ param.xaxis ][row].toJSON(),
            'v': srcData[ param.yaxis[i] ][row].toJSON()
          });

        }

      }

      // return result: only those entries with actual values
      return data.filter( d => d.values.length > 0 );

    } else {

      /* ------------- multitude may be given by value in one column ------------- */

      // actual workflow

      // partition the data
      const partDatasets = await Partition.partition({
                                            'data_id':  param['data_id'],
                                            'partCols': [ param['mult'] ]
                                          });

      // adjust column indexes (column <mult> is removed now)
      const colIndex = {
          xaxis: ( param['mult'] > param['xaxis'] ) ? param['xaxis'] : param['xaxis'] - 1,
          yaxis: ( param['mult'] > param['yaxis'] ) ? param['yaxis'] : param['yaxis'] - 1,
      };

      // array to collect all serialization promises
      const res = [];

      // prepare list of column serializer labels
      const colLabels = [],
            ds0       = DataStore.getDataset( partDatasets[0]['data_id'] ),
            rowCount  = ds0.getRowCount(),
            colCount  = ds0.getColCount();
      for( let i=colCount; i--; ) {
        colLabels.push( null );
      }
      colLabels[ colIndex['xaxis'] ] = 'd';
      colLabels[ colIndex['yaxis'] ] = 'v';

      // serialize all partitioned datasets
      for( let i=0; i<partDatasets.length; i++ ) {
        res.push( Serializer({
          'data_id':  partDatasets[i]['data_id'],
          'colNames': colLabels
        }));
      }

      // wait until all are serialized
      const d = await Promise.all( res );

      // final result
      const dataRes = [];

      // push all data to final result
      for( let i=0; i<d.length; i++ ) {
        dataRes.push({
          'name': partDatasets[i].fixedCol
                                 .map( function( el ){
                                    return el.value;
                                  }).join( ' - ' ),
          'values': d[i].data
        });
      }

      // resolve deferred
      return dataRes;

    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'getStaticSVG': getStaticSVG,
  };

});