define( [ 'store/data', 'basic/types/Dataset', 'comp/filter/createFilter' ],
function(  DataStore  ,      Dataset         ,          Factory           ){


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX filterDataset XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * apply a filter onto a dataset
   * for filter definition see comp/filter/createFilter
   *
   * param          | type          | desc
   * --------------------------------------------------------------------------
   * data_id        | Number        | id of the dataset to partition
   * filterDef      | Object        | definition of the filter to apply
   *
   * return:
   *
   * param          | type          | desc
   * --------------------------------------------------------------------------
   * data_id        | Number        | id of the modified dataset
   * wfHints        | Object        | some hints for the workflow tracking
   *
   */
  async function applyFilter( dsId, filterDef ) {

    // convert filter to applicable function
    const filter = await Factory( filterDef );

    // get source dataset
    var ds = DataStore.getDataset( dsId );

    // prepare new/target dataset
    var newData = new Array( ds.data.length );
    for( var i=0; i<newData.length; i++ ) {
      newData[i] = [];
    }

    // run through source dataset
    var row = new Array( ds.data.length );
    for( var i=0; i<ds.data[0].length; i++ ) {

      // collect all row values
      for( var j=0; j<ds.data.length; j++ ) {
        row[j] = ds.data[j][i];
      }

      // if passing the filter ...
      if( filter( row ) ) {

        // insert into result dataset
        for( var j=0; j<row.length; j++ ) {
          newData[j].push( row[j] );
        }

      }

    }

    // create new Dataset entry
    var entry = new Dataset( ds, newData );

    // add to Datastore
    var id = DataStore['addDataset']( entry );

    // create hints for workflow tracking
    var wfCols = new Array( ds.data.length );
    for( var i=wfCols.length; i--; ) {
      wfCols[i] = {
          'basedOn': filter['usedCols'],
          'former': i
      };
    }

    // done
    return {
      dsId: id,
      wfHints: {
        'columns': wfCols
      }
    };

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX dropColumn XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * drops columns from a specific dataset
   *
   * param          | type          | desc
   * --------------------------------------------------------------------------
   * data_id        | Number        | id of the dataset to partition
   * columns        | Array{Number} | ids of the columns to drop
   *
   * return:
   *
   * param          | type          | desc
   * --------------------------------------------------------------------------
   * data_id        | Number        | id of the modified dataset
   *
   */
  async function dropColumns( dsId, dropCols ) {

    // sort columns to be dropped
    dropCols.sort();

    // get source dataset
    var ds = DataStore.getDataset( dsId );

    // make a copy of the dataset
    var newData = ds.data.slice(0);

    // make sure we got an array as input
    if( !(dropCols instanceof Array) ) {
      dropCols = [ dropCols ];
    }

    // remove all data columns
    for( var i=dropCols.length; i--; ) {
      newData.splice( dropCols[i], 1 );
    }

    // copy column metadata
    var colMeta = ds.getColumnMeta();

    // remove respective columns from meta
    for( var i=dropCols.length; i--; ) {
      colMeta.splice( dropCols[i], 1 );
    }

    // create new column objects reflecting the respective new positions
    for( var i=0; i<colMeta.length; i++ ) {
      colMeta[i] = colMeta[i].clone( i );
    }

    // create new dataset
    var newDs = new Dataset( ds, colMeta, newData );

    // add new dataset to store
    var id = DataStore['addDataset']( newDs );

    // resolve result
    return {
      'dsId': id
    };

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  return {
    'applyFilter': applyFilter,
    'dropColumns': dropColumns
  };

});