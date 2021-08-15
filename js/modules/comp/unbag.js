"use strict";
/*
 * perform a group by on a dataset by given columns
 */
define([ 'store/data',
         'basic/types/Dataset',
         'util/requirePromise',
         ],
function( Datastore,
          Dataset,
          requireP
        ){

  return {
    'unbag': unbag
  };


  /**
   * perform an aggregation of a dataset using the given parameters
   * @param  {Object}    ds       dataset
   * @param  {Array}     col      column, which to unbag
   * @param  {Array}     fktName  function to use for unbagging
   */
  async function unbag( ds, col, fktName ) {

    // just allow letters in aggregate function names
    fktName = fktName.replace( /[^a-zA-Z]*/, '' );

    // get the respective unbag functions and description
    const [desc, fkt] = await requireP( [ 'comp/aggregate/' + fktName + '.desc', 'comp/aggregate/' + fktName ] );

    // get the new data
    let newData;
    if( desc.expanding ) {
      newData = unbagExp( ds, col, fkt );
    } else {
      newData = unbagSimple( ds, col, fkt );
    }

    // compile new metadata
    const colMeta = ds.getColumnMeta(),
          newColMeta = [];
    for( let i=0; i<colMeta.length; i++ ) {

      // clone the old metadata
      newColMeta.push( colMeta[i].clone( i ) );

    }

    // if bagged before but now is not, adjust meta
    if( !desc.bagging ) {

      // new datatype is the old subdatatype
      newColMeta[col].setDatatype( newColMeta[col].getAttribute( 'subdatatype' ) );

      // unset subdatatype
      newColMeta[col].setAttribute( 'subdatatype', undefined );

    }

    // create new dataset
    const newDs = new Dataset( ds, newColMeta, newData );

    // add to store
    const data_id = Datastore.addDataset( newDs );

    // return
    return data_id;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Simple Unbag XXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * do the unbagging without an expanding unbag function
   */
  function unbagSimple( ds, unbagCol, fkt ){

    // get a link to the actual data
    let data = ds.getData();

    // get count of columns
    let colCount = ds.getColCount();

    // build an array to hold the new dataset
    let newCol = [];

    // traverse all rows
    for( let row=0; row<data[0].length; row++ ) {

      // unbag the column
      newCol.push( fkt( data[ unbagCol ][ row ].getValues() ) );

    }

    // assemble complete data
    let newData = [];
    for( let i=0; i<colCount; i++ ) {
      if( i == unbagCol ) {
        newData.push( newCol );
      } else {
        newData.push( data[ i ] );
      }
    }

    return newData;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXX Expanding Unbag XXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * do the unbagging with an expanding unbag function
   */
  function unbagExp( ds, unbagCol, fkt ){

    // get a link to the actual data
    let data = ds.getData();

    // get count of columns
    let colCount = ds.getColCount();

    // build an array to hold the new dataset
    let newData = [];
    for( let i=0; i<data.length; i++ ) {
      newData.push( [] );
    }

    // traverse all rows
    for( let row=0; row<data[0].length; row++ ) {

      // collect the created rows
      let resultRows = [];

      // grab all values
      let values = [];
      for( let j=0; j<colCount; j++ ) {
        if( j == unbagCol ) {

          // the column to unbag
          resultRows.push( fkt( data[ j ][ row ].getValues() ) );

        } else {

          // other columns
          resultRows.push( data[ j ][ row ] );

        }

      }

      // add all created new lines
      recAddRows( newData, resultRows, [] );

    }

    return newData;

  }


  /**
   * create all new rows given by the data in allVals
   * push those to data
   * curVal is the currently created row
   */
  function recAddRows( data, allVals, curVal ) {

    // end of recursion: for every column, one element has been picked
    if( allVals.length == curVal.length ) {
      for( let i=0; i<curVal.length; i++ ) {
        data[i].push( curVal[i] );
      }
      return;
    }

    // ... else iterate through all values for the first not fixed column
    let curIndex = curVal.length,
        nextVals = allVals[ curIndex ];
    if( nextVals instanceof Array ) {

      for( let i=0; i<nextVals.length; i++ ) {
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