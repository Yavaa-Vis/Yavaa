"use strict";
/*
 * perform a group by on a dataset by given columns
 */
define([ 'store/data',
         'basic/types/Dataset',
         'comp/_common/SearchTree',
         'util/requirePromise',
         ],
function( Datastore,
          Dataset,
          SearchTree,
          requireP
        ){

  return {
    'aggregate': aggregate
  };


  /**
   * perform an aggregation of a dataset using the given parameters
   * @param  {Object}    ds            dataset
   * @param  {Array}     groupCols     array of column indices to group by
   * @param  {Array}     aggFktNames   array of aggregation functions' names for the columns to be aggregated
   */
  async function aggregate( ds, groupCols, aggFktNames ) {

    // get the line iterator
    const lookup = new SearchTree( ds, groupCols );
    lookup.init();

    // get a link to the actual data
    const data = ds.getData();

    // build an array to hold the new dataset
    const newData = [];
    for( let i=0; i<data.length; i++ ) {
      newData.push( [] );
    }

    // assemble aggregate functions
    aggFktNames = aggFktNames || [];
    const aggRequire = [];
    for( let i=0; i<data.length; i++ ) {

      // columns to aggregate upon
      if( groupCols.indexOf( i ) > -1 ) {
        aggRequire.push( 'comp/aggregate/takeOne' );
        aggRequire.push( 'comp/aggregate/takeOne.desc' );
        continue;
      }

      // columns to aggregate
      if( aggFktNames[i] ) {

        // just allow letters in aggregate function names
        aggFktNames[i] = aggFktNames[i].replace( /[^a-zA-Z]*/, '' );

        // use function to load module and description
        aggRequire.push( 'comp/aggregate/' + aggFktNames[i] );
        aggRequire.push( 'comp/aggregate/' + aggFktNames[i] + '.desc' );

      } else {

        // use default function to load module and description
        aggRequire.push( 'comp/aggregate/bag' );
        aggRequire.push( 'comp/aggregate/bag.desc' );

      }

    }


    // load aggregate functions
    const aggResponse = await requireP( aggRequire );

    // collect all functions
    const aggFkt  = new Array( aggResponse.length / 2 ),
          aggDesc = new Array( aggResponse.length / 2 );
    for( var i=0; i<aggResponse.length/2; i++ ) {
      aggFkt[i]  = aggResponse[2*i];
      aggDesc[i] = aggResponse[2*i + 1];
    };

    // traverse all leafs
    while( lookup.hasNext() ) {

      // get all lines for this group
      const lines = lookup.next();

      // collect the created rows
      const resultRows = [];

      // get aggregate value for all columns
      for( var i=0; i<newData.length; i++ ) {

        // grab all values
        var values = [];
        for( let j=0; j<lines.length; j++ ) {
          values.push( data[ i ][ lines[j] ] );
        }

        // get new value
        resultRows.push( aggFkt[i]( values ) );

      }

      // add all created new lines
      recAddRows( newData, resultRows, [] );

    }

    // compile new metadata
    const colMeta = ds.getColumnMeta(),
          newColMeta = [];
    for( var i=0; i<colMeta.length; i++ ) {

      // clone the old metadata
      newColMeta.push( colMeta[i].clone( i ) );

      // was/is this a bagged datatype before/after the aggregation?
      var bagBefore = newColMeta[i].getDatatype() == 'bag',
          bagAfter  = !!aggDesc[i].bagging;

      // if not bagged before but now is, adjust meta
      if( !bagBefore && bagAfter ) {

        // old type is now subdatatype
        newColMeta[i].setAttribute( 'subdatatype', newColMeta[i].getDatatype() );

        // new datatype is bag
        newColMeta[i].setDatatype( 'bag' );

      }

      // if bagged before but now is not, adjust meta
      else if( bagBefore && !bagAfter ) {

        // new datatype is the old subdatatype
        newColMeta[i].setDatatype( newColMeta[i].getAttribute( 'subdatatype' ) );

        // unset subdatatype
        newColMeta[i].setAttribute( 'subdatatype', undefined );

      }

    }

    // create new dataset
    const newDs = new Dataset( ds, newColMeta, newData );

    // add to store
    const data_id = Datastore.addDataset( newDs );

    // return
    return data_id;

  }




  /**
   * create all new rows given by the data in allVals
   * push those to data
   * curVal is the currently created row
   */
  function recAddRows( data, allVals, curVal ) {

    // end of recursion: for every column, one element has been picked
    if( allVals.length == curVal.length ) {
      for( var i=0; i<curVal.length; i++ ) {
        data[i].push( curVal[i] );
      }
      return;
    }

    // ... else iterate through all values for the first not fixed column
    var curIndex = curVal.length,
        nextVals = allVals[ curIndex ];
    if( nextVals instanceof Array ) {

      for( var i=0; i<nextVals.length; i++ ) {
        curVal[ curIndex ] = nextVals[i];
        recAddRows( data, allVals, curVal );
      }

    } else {

      curVal.push( nextVals );
      recAddRows( data, allVals, curVal );

    }

    // remove the last element for further recursion calls
    curVal.pop();

  }

});