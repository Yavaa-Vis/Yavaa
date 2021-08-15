define( [ 'store/data', 'basic/types/Dataset' ],
function(  DataStore  ,      Dataset          ){

  // TODO add a dropped values field to combine partition with filter for single pass over data

  /**
   * partition a dataset by a combination of columns
   * partitioned columns get dropped
   *
   * param          | type          | desc
   * --------------------------------------------------------------------------
   * data_id        | Number        | id of the dataset to partition
   * partCols       | Array{Number} | ids of the columns by which to partition
   *                |               |   ... given in the order by which to
   *
   * return:
   * Array of
   *
   * param          | type          | desc
   * --------------------------------------------------------------------------
   * data_id        | Number        | id of the partitioned dataset
   * fixedCol       | Object        | 'value': the value of the fixed column for this partition
   *                |               | 'type': pointer to the semantic type of the fixed column
   */
  async function partition( param ) {

    // get source dataset
    const src     = DataStore.getDataset( param['data_id'] ),
          srcData = src.getData();

    // shortcut
    const partCols = param['partCols'];

    // remaining columns
    const remCols = [];
    for( let i=0; i<src.data.length; i++ ) {
      if( !partCols.includes( i ) ) {
        remCols.push( i );
      }
    }

    // resulting datasets
    const lookup = {},
          resultDs = [];

    // run through dataset
    let ds, runner, val;
    for( let i=0; i<srcData[0].length; i++ ) {

      // get target dataset container
      runner = lookup;
      for( let j=0; j<partCols.length; j++ ) {
        val = '' + srcData[ partCols[j] ][i];

        // make sure there is an entry
        if( !(val in runner) ) {

          if( j < partCols.length - 1) {

            // another entry in the lookup
            runner[ val ] = {};

          } else {

            // or the real deal
            runner[ val ] = {
                'ds': new Array( remCols.length ),
                'fixedCol': []
            };

            // prepare data array
            for( let k=remCols.length; k--; ) {
              runner[ val ]['ds'][k] = [];
            }

            // add information about fixed columns
            for( let k=0; k<partCols.length; k++ ) {
              runner[ val ][ 'fixedCol' ].push({
                'type':  src.meta.columns[k],
                'value': src.data[ partCols[k] ][i]
              });
            }

            // add to resulting datasets
            resultDs.push( runner[ val ] );

          }

        }

        // go on
        runner = runner[ val ];
      }

      // shortcut to actual dataset
      ds = runner['ds'];

      // copy values
      for( let j=ds.length; j--; ) {
        ds[ j ].push( src.data[ remCols[ j ] ][ i ] );
      }
    }

    // create new metadata object
    const newMeta = src.getMetaCopy();
    newMeta.columns = newMeta.columns
                             .filter( (col, i) => !partCols.includes( i ) );

    // insert all datasets to datastore
    let retResult = [], newDs, newId;
    for( let i=resultDs.length; i--; ) {

      // create dataset
      newDs = new Dataset( newMeta, resultDs[i]['ds'] );

      // insert to datastore
      newId = DataStore['addDataset']( newDs );

      // add to returned result
      retResult.push({
        'data_id': newId,
        'fixedCol': resultDs[i]['fixedCol']
      });

    }

    // done
    return retResult;

  }



  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return {
    'partition': partition
  };

});