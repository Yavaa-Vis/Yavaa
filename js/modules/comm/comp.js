/**
 * provide access to computation functions
 * convert datatypes and responses
 */
define( [ 'store/data',
          'util/requirePromise' ],
function( DataStore,
          requireP ){

  return {
    'aggregate':      aggregate,
    'applyFunction':  applyFunction,
    'dropColumns':    dropColumns,
    'filter':         filter,
    'joinDatasets':   joinDatasets,
    'setUnit':        setUnit,
    'unbag':          unbag,
    'unionDatasets':  unionDatasets,
  };


  /**
   * join 2 datasets based on given join conditions
   *
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * base_data_id | Number                      | Id of the the dataset, which to augment
   * augm_data_id | Number || String            | Reference to the dataset with which to augment
   *              |                             | Number => already loaded dataset from store
   *              |                             | String => Reference of a not yet loaded dataset (not avail)
   * join_cond    | Array[ Array[Number] ]      | References to the join conditions by order in the
   *              |                             | respective dataset [colDS1, colDS2]
   *
   * returns
   *
   * action: "done"
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Reference to the created dataset
   */
  async function joinDatasets( params ) {

    // includes
    const join = await requireP( 'comp/join' );

    // get references to both datasets
    const ds1 = DataStore.getDataset( params['data_id'] ),
          ds2 = DataStore.getDataset( params['augm_data_id'] );

    // do the join
    const newDsID = await join.doCrossJoin( ds1, ds2, params['join_cond'] );

    // relay result
    return {
      'action': 'done',
      'params': {
        'data_id': newDsID
      }
    };

  }


  /**
   * union 2 datasets based on the given conditions
   *
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * base_data_id | Number                      | Id of the the dataset, which to augment
   * augm_data_id | Number || String            | Reference to the dataset with which to augment
   *              |                             | Number => already loaded dataset from store
   *              |                             | String => Reference of a not yet loaded dataset (not avail)
   * join_cond    | Array[ Array[Number] ]      | References to the union conditions by order in the
   *              |                             | respective dataset [colDS1, colDS2]
   *
   * returns
   *
   * action: "done"
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Reference to the created dataset
   */
  async function unionDatasets( params ) {

    throw Error( 'Unimplemented function' );

  }


  /**
   * perform a group by on a dataset using the given columns
   *
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Id of the the dataset, which to modify
   * cols         | Array[Number]               | List of columns to group by
   * agg          | Array[String]               | List of aggregation functions for columns to be aggregated
   *
   * returns
   *
   * action: "done"
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Reference to the created dataset
   */
  async function aggregate( params ) {

    // includes
    const aggregate = await requireP( 'comp/aggregate' );

    // get references to both datasets
    var ds = DataStore.getDataset( params['data_id'] );

    // do the aggregation
    const newDsID = await aggregate.aggregate( ds, params['cols'], params['agg'] );

    // construct hints for workflow manager
    const basedOn = [],
          cols = ds.getColCount();
    for( var i=0; i<cols; i++ ) {
      basedOn.push({
        'basedOn': params['cols']
      });
    }

    // relay result
    return {
      'action': 'done',
      'params': {
        'data_id': newDsID
      },
      '_wfHints': {
        'columns': basedOn
      }
    };

  }


  /**
   * unbag a column within a dataset
   *
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | ID of the the dataset, which to augment
   * col          | Number                      | ID of the column to unbag
   * agg          | String                      | Function used to unbag
   *
   * returns
   *
   * action: "done"
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Reference to the created dataset
   */
  async function unbag( params ) {

    // includes
    const unbag = await requireP( 'comp/unbag' )

    // get references to both datasets
    var ds = DataStore.getDataset( params['data_id'] );

    // do the unbagging
    const newDsID = await unbag.unbag( ds, params['col'], params['agg'] );

    // construct hints for workflow manager
    var basedOn = [];
    basedOn[ params['col'] ] = {
        'basedOn': params['col']
    };

    // relay result
    return {
      'action': 'done',
      'params': {
        'data_id': newDsID
      },
      '_wfHints': {
        'columns': basedOn
      }
    };

  }


  /**
   * for a given dataset and column, change the unit
   *
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | ID of the the dataset, which to augment
   * col_id       | Number                      | ID of the column to unbag
   * unit         | String                      | URI of the unit to change to
   *
   * returns
   *
   * action: "done"
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Reference to the created dataset
   */
  async function setUnit( params ) {

    // includes
    const setUnit = await requireP( 'comp/setUnit' )

    // change the unit
    const newDsID = await setUnit( params.data_id, params.col_id, params.unit );

    // TODO extend
    // construct hints for workflow manager
    var basedOn = [];
    basedOn[ params['col_id'] ] = {
        'basedOn': params['col_id']
    };

    // relay result
    return {
      'action': 'done',
      'params': {
        'data_id': newDsID
      },
      '_wfHints': {
        'columns': basedOn
      }
    };

  }



  /**
   * for a given dataset and column, apply the given operation
   *
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | ID of the the dataset, which to change
   * col_id       | Number                      | ID of the column to apply the operation to
   * op_type      | String                      | The type of the given operation
   *              |                             | one of: "UDF"
   * op           | String                      | the operation to be applied
   *
   * returns
   *
   * action: "done"
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Reference to the created dataset
   */
  async function applyFunction( params ) {

    // load module
    const applyFunktion = await requireP( 'comp/applyFunction' );

    // apply the function
    const result = await applyFunktion( params['data_id'],
                                        params['col_id'],
                                        params['op'],
                                        params['op_type'],
                                        !!params['new_col'],
                                        params['label'] );

    // done
    return {
      'action': 'done',
      'params': {
        'data_id': result.dsId,
      },
      '_wfHints':  result.wfHints,
    }

  }



  /**
   * for a given dataset and column, apply the given operation
   *
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | ID of the the dataset, which to change
   * filterDef    | Object                      | definition of the filter's to be applied
   *              |                             | for definition see comp/filter/createFilter
   *
   * returns
   *
   * action: "done"
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Reference to the modified dataset
   */
  async function filter( params ) {

    // load module
    const filter = await requireP( 'comp/filterDataset' );

    // apply the function
    const result = await filter.applyFilter( params['data_id'], params['filterDef'] );

    // done
    return {
      'action': 'done',
      'params': {
        'data_id': result.dsId,
      },
      '_wfHints':  result.wfHints,
    }

  }




  /**
   * for a given dataset and column, apply the given operation
   *
   * param          | type          | desc
   * --------------------------------------------------------------------------
   * data_id        | Number        | id of the dataset to partition
   * columns        | Array{Number} | ids of the columns to drop
   *
   * returns
   *
   * action: "done"
   * name         | type                        | desc
   * ----------------------------------------------------------------------------------------------
   * data_id      | Number                      | Reference to the modified dataset
   */
  async function dropColumns( params ) {

    // load module
    const filter = await requireP( 'comp/filterDataset' );

    // apply the function
    const result = await filter.dropColumns( params['data_id'], params['columns'] );

    // done
    return {
      'action': 'done',
      'params': {
        'data_id': result.dsId,
      }
    }

  }
});