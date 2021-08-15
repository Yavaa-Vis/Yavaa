"use strict";
/**
 * Provide access to the datastore for the frontend
 * wrap answers up to match specified format
 * mimics the interface of /store/data
 */
define( [ 'basic/Constants',
          'store/data' ],
function( Constants,
          Datastore
){

  return {
    'getMeta':          getMeta,
    'getData':          getData,
    'getPartialData':   getPartialData,
    'getColumnValues':  getColumnValues,
    'setColumnLabel':   setColumnLabel,
  };


  /**
   * return metadata for a given dataset
   */
  function getMeta( param ) {
    return {
      'action': 'meta',
      'params': {
        'data_id':  param['data_id'],
        'meta':     Datastore['getMeta']( param[ 'data_id' ] ),
        'entries':  Datastore['getDataset']( param[ 'data_id'] )['getRowCount']()
      }
    };

  }

  /**
   * return the full content of a content dataset
   */
  function getData( param ) {

    // get dataset
    const ds = Datastore.getDataset( param['data_id'] );

    // get requested rows
    const data = ds.getDataRows();

    return {
      'action': 'data',
      'params': {
        'data_id':  param['data_id'],
        'data':     data
      }
    };
  }

  /**
   * return parts of a given dataset
   */
  function getPartialData( param ) {

    // get dataset
    const ds = Datastore.getDataset( param['data_id'] );

    // get requested rows
    const data = ds.getPartialData( param['start'], param['entries'] );

    // return wrapped result
    return {
      'action': 'data',
      'params': {
        'data_id':  param['data_id'],
        'data':     data
      }
    };

  }

  /**
   * return the distinct values in a given dataset's column
   */
  function getColumnValues( param ) {

    // get metadata
    const ds = Datastore.getDataset( param[ 'data_id' ] );

    // get respective column meta
    const col = ds.getColumnMeta( param['col_id'] );

    // get distinct values
    let distValues = col.getDistinctValues();

    // make sure the result present
    if( distValues == null ) {

      ds.findDistinctValues( col );
      distValues = col.getDistinctValues();

    }

    // some types need special care
    switch( col.getDatatype() ) {

      case Constants.DATATYPE.TIME:

        // we need the timestamps and detail level on the other side
        distValues = { ... distValues };
        distValues['detail']      = (distValues['min'] && distValues['min']['_detail']);
        distValues['minFormated'] = distValues['min'];
        distValues['maxFormated'] = distValues['max'];
        distValues['min']         = distValues['min'] && distValues['min'].toJSON( true );
        distValues['max']         = distValues['min'] && distValues['max'].toJSON( true );
        break;

      case Constants.DATATYPE.SEMANTIC:

        // make sure we have only unique values in the export
        distValues = { ... distValues };
        const unique = distValues.list.reduce( (all,el) => {
          all[ el.hash() ] = el;
          return all;
        }, {} );
        distValues.list = Object.values( unique ).map( (el) => ({ uri: el.getURI(), label: el.toString() }) );
        break;

    }

    // return
    return {
      'action': 'columnValues',
      'params': {
        'data_id':  param['data_id'],
        'col_id':   param['col_id'],
        'values':   distValues
      }
    }

  }

  /**
   * set the label for a specific column
   */
  function setColumnLabel( param ) {

    // get metadata
    const ds = Datastore.getDataset( param[ 'data_id' ] );

    // get respective column meta
    const col = ds.getColumnMeta( param['col_id'] );

    // set label
    col.setLabel( param['label'] );

    // done
    return {
      'action': 'done',
      'params': {
        'data_id':  param['data_id']
      }
    }
  }

});