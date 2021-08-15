"use strict"
/*
 * General Naming
 *
 * Dataset  ...   the whole dataset including meta and data
 * Data     ...   just the mere data
 * Meta     ...   just the mere metadata
 */

define( [ 'util/requirePromise' ], function( requireP ) {

  // the store itself
  var store = [];

  // return accessor methods
  return {
    'addDataset':             addDataset,
    'deriveDatasetByColumn':  deriveDatasetByColumn,
    'getDataset':             getDataset,
    'getMeta':                getMeta,
    'getData':                getData,
    'getPartialData':         getPartialData
  };


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dataset Accessors XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * add a new dataset to the store
   * @param {Object}  dataset   Dataset to store
   * @return {Number}           the id of the new dataset
   */
  function addDataset( dataset ) {
    store.push( dataset );
    dataset.setID( store.indexOf( dataset ) );
    return dataset.getID();
  }


  /**
   * retrieve a dataset by id
   * @param   {Number}  id    ID of the dataset in question
   * @return  {Object}        the requested dataset
   */
  function getDataset( id ) {
    if( typeof store[id] !== 'undefined' ) {
      return store[ id ];
    } else {
      return null;
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Meta Accessors XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * get the metadata in a particular dataset
   *
   * @param   {Number}  id      ID of the dataset in question
   * @return  {Object}          the requested metadata
   */
  function getMeta( id ) {

    if( typeof store[id] !== 'undefined' ) {
      return store[ id ].getMeta();
    } else {
      return null;
    }
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Data Accessors XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * get the data in a particular dataset
   *
   * @param   {Number}  id      ID of the dataset in question
   * @return  {Array}           the requested data
   */
  function getData( id ) {
    if( id in store ) {
      return store[ id ].getData();
    } else {
      return null;
    }
  }

  /**
   * get a part of the data in a particular dataset
   *
   * @param   {Number}  id      ID of the dataset in question
   * @param   {Number}  start   Index of row to start from
   * @param   {Number}  entries Count of rows to return
   * @return  {Array}           the requested data
   */
  function getPartialData( id, start, entries )  {

    // check, if dataset is present
    if( !(id in store) ) {
      return null;
    } else {
      return store[id].getPartialData( start, entries );
    }

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dataset Factory XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * create a new dataset by adding/replacing a column of an exitsing one
   *
   * @param {Number}    sourceId      ID of the source dataset
   * @param {Number}    colPos        position of the column to replace or -1, if new column
   * @param {Array}     colData       data of the added/replaced column
   * @param {Column}    colMeta       meta data of the column
   */
  async function deriveDatasetByColumn( sourceId, colPos, colData, colMeta ){

    // grab the source dataset
    const sourceDs = getDataset( sourceId );
    if( sourceDs == null ){ throw new Error(`Could not find dataset ${sourceId}`); }

    // load required modules
    const Dataset = await requireP( 'basic/types/Dataset' );

    // build new dataset; copy data
    const newDs = new Dataset( sourceDs, sourceDs.getData().slice(0) );

    // insert column
    if( colPos < 0 ) {

      // append column
      newDs.addColumn( colMeta, colData );

    } else {

      // replace old column
      newDs.replaceColumn( colPos, colData, colMeta );

      // update column metadata
      colMeta.setPosition( colPos );

    }

    // add dataset to store
    const dsId = addDataset( newDs );

    // done
    return dsId;
  }

});