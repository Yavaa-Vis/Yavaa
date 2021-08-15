"use strict";
/**
* join two given datasets based on given columns
*/
define([ 'store/data',
         'basic/types/Dataset',
         'comp/_common/SearchTree',
         'util/LargeBoolArray',
         'basic/types/Null' ],
function( Datastore,
          Dataset,
          SearchTree,
          LargeBooleanArray,
          NullType ){

  return {
    'doCrossJoin': doCrossJoin
  };


  /**
   * join the given two columns based on the given join condition
   *
   * @param  {Object}    ds1         first dataset to join
   * @param  {Object}    ds2         second dataset to join
   * @param  {Array}     joinCond    array of arrays of column indices from both datasets to specify the join condition
   */
  function doCrossJoin( ds1, ds2, joinCond ) {

    // make a list of involved columns for each dataset
    const joinCols1 = [],
          joinCols2 = [];
    for( let i=0; i<joinCond.length; i++ ) {
      joinCols1.push( joinCond[i][0] );
      joinCols2.push( joinCond[i][1] );
    }

    // get data
    const data1 = ds1.getData(),
          data2 = ds2.getData(),
          colCount1 = ds1.getColCount(),
          colCount2 = ds2.getColCount();

    // list of columns from ds2, which are not used in the join condition
    // and hence should be part of the result
    const dataCols2 = [];
    for( let i=0; i<colCount2; i++ ) {
      if( joinCols2.indexOf( i ) < 0 ) {
        dataCols2.push( i );
      }
    }

    // source indices for each output column from the perspective of ds2
    const source2 = [];
    for( let i=0; i<joinCond.length; i++ ) {
      source2[ joinCond[i][0] ] = joinCond[i][1];
    }
    for( let i=0; i<dataCols2.length; i++ ) {
      source2[ colCount1 + i ] = dataCols2[ i ];
    }

    // build a search tree out of the second dataset
    const lookup = new SearchTree( ds2, joinCols2 );
    lookup.init();

    // remember which rows of ds2 we used
    const usedDs2Rows = new LargeBooleanArray( ds2.getRowCount() );

    // build an array to hold the new dataset
    const newData = [];
    for( let i=0; i<data1.length; i++ ) {
      newData.push( [] );
    }
    for( let i=0; i<dataCols2.length; i++ ) {
      newData.push( [] );
    }

    // walk through the data
    const dims = [];
    for( let i=0; i<ds1.getRowCount(); i++ ) {

      // build a list of the respective dimension values
      for( let j=0; j<joinCols1.length; j++ ) {
        dims[ j ] = data1[ joinCols1[j] ][ i ];
      }

      // get the respective matching rows from ds2
      const matches = lookup.match( dims );

      // add to new dataset
      if( matches.length > 0 ) {

        // INNER JOIN
        for( let k=0; k<matches.length; k++ ) {

          // copy from dataset 1
          for( let j=0; j<data1.length; j++ ) {
            newData[j].push( data1[j][i] );
          }
          // copy from dataset 2
          for( let j=0; j<dataCols2.length; j++ ) {
            newData[ colCount1 + j ].push( data2[ dataCols2[j] ][ matches[k] ] );
          }

        }

        // remember the ones we used
        usedDs2Rows.set( ... matches );

      } else {

        // LEFT OUTER JOIN

        // copy from dataset 1
        for( let j=0; j<data1.length; j++ ) {
          newData[j].push( data1[j][i] );
        }
        // fill with null values
        for( let j=0; j<dataCols2.length; j++ ) {
          newData[ colCount1 + j ].push( NullType() );
        }

      }


    }

    // RIGHT OUTER JOIN
    for( const row of usedDs2Rows.falseIterator() ) {

      // copy from dataset 2
      for( let i=0; i<source2.length; i++ ) {
        if( typeof source2[i] == 'number' ) {
          newData[i].push( data2[ source2[i] ][ row ] );
        } else {
          newData[i].push( NullType() );
        }

      }

    }

    // compile new metadata
    const colMeta1 = ds1.getColumnMeta(),
          colMeta2 = ds2.getColumnMeta(),
          newColMeta = [],
          offset = colMeta1.length;
    for( let i=0; i<colMeta1.length; i++ ) {      // copy ds1 part
      newColMeta.push( colMeta1[i].clone( i ) );
    }
    for( let i=0; i<dataCols2.length; i++ ) {     // copy ds2 part
      newColMeta.push( colMeta2[ dataCols2[i] ].clone( offset + i ) );
    }

    // create new dataset
    const newDs = new Dataset( ds1, newColMeta, newData );

    // add to store
    const data_id = Datastore.addDataset( newDs );

    // return
    return data_id;
  }

});