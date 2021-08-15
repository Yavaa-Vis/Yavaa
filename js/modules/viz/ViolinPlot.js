"use strict";
/**
 * Defines an object to produce ViolinPlot charts
 * * modeled after BoxPlot
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
          'viz/ViolinPlot.desc',
          'viz/ViolinPlot.plot',
          'comp/aggregate',
          'text!template/viz/ViolinPlot.tpl.css',
], function( DataStore,
             Desc,
             Plotter,
             aggregate,
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
                              'id':       ('ViolinPlot' + Date.now()),
                              'width':    960,
                              'height':   500,
                              'title':{
                                'yaxis':  cols[ param['val'] ].getLabel()
                              },
                              '_domains': cols.map( (c) => c && c.getDistinctValues() ),
                            }, param, {
                              '_legend':  (typeof param.category != 'undefined') ? 0 : undefined,
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

    // get (grouped) dataset
    const ds    = DataStore.getDataset( param.data_id ),
          data  = ds.getData();

    // get count of entries
    const entryCount = data[0].length;

    // prep result
    const result = [],
          lookup = {};

    // process each row
    for( let i=0; i<entryCount; i++ ) {

      // get all values
      const label = data[ param.cat ][ i ].toJSON(),
            value = data[ param.val ][ i ].toJSON(),
            occ   = data[ param.occ ][ i ].toJSON();

      // find respective entry
      if( !(label in lookup) ) {

        // create new entry
        const entry = {
          name:   label,
          values: {},
        }
        result.push( entry );

        lookup[ label ] = entry;

      }
      if( !(value in lookup[label].values) ) {
        lookup[label].values[value] = 0;
      }

      // add the occurrences
      lookup[label].values[value] += parseFloat( occ );

    }

    // pass data on
    return result;

  }


  /**
   * prepare the data to be included in a visualisation
   * alternative version that allows for value duplicates and actually counts their occurrences
   */
  async function prepareDataCounting( param ) {

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

      // count occurrences
      const counts = {};
      for( let value of values ) {
        const v = value.toJSON();
        counts[ v ] = counts[ v ] || 0;
        counts[ v ] += 1;
      }

      // add to result
      result.push({
        name:   label,
        values: counts
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