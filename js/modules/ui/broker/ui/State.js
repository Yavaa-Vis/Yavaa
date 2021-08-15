"use strict";
/**
 * preserve the current state of the UI
 * - datasets active
 * - viz-settings for active datasets
 *
 * restore the previous state, if the user revisits the site
 * - replay all known workflows
 * - reconnect to previous session ?
 *
 * data is managed in localStorage
 */
define( [
  'ui/basic/Yavaa.global',
  'ui/basic/types/Dataset'
], function(
    Y,
    Dataset
){

  // property name in localstorage
  const STORAGE_ID = 'yavaa-state';

  return class State {

    constructor( dsNav ){

      // maintain a link to the dataset navigation
      this._dsNav = dsNav;

      // currently active dataset
      this._curDs = null;

      // map from data_id to state object
      this._store = new Map();

    }

    /**
     * currently active dataset
     */
    get curDs() {
      return this._curDs;
    }
    set curDs( val ) {
      // save as active
      this._curDs = val;
      // check for changes
      this.changeDataset( val );
    }


    /**
     * add a new tab / dataset to the state tracking
     * @param   {Dataset}     ds    the dataset that to be added
     */
    async addDataset( ds ) {

      // sometimes there might not be a dataset given
      if( ds === null ) {
        return;
      }

      // if the dataset is already in the store, we redirect to changeDataset()
      if( this._store.has( ds ) ) {
        return changeDataset( ds );
      }

      // retrieve workflow
      // TODO maybe change this to get a pseudo-workflow as it is smaller in size
      const wfRaw = await Y.CommBroker.execCommand({
                      action: 'getWorkflow',
                      params: {
                        data_id: ds.getID(),
                        format:  'JSON',
                      },
                    }),
            wf    = JSON.parse( wfRaw.params.workflow );

      // create a new store item
      const entry = {
          // keep the currently active engine-dataset-ID to track changes
          data_id:  ds.getID(),
          // there is no viz to start with
          viz:      null,
          // the respective workflow
          wf:       wf,
          // shown view
          view:     ds.getView(),
          // alias given
          alias:    ds.getAlias(),
          // dataset id - for debugging
          id:       ds.getID(),
      };

      // add to map
      this._store.set( ds, entry );

      // persist the new state
      this._persist();

    }

    /**
     * intercept changes in dataset and check for unknown IDs
     * @param   {Dataset}     ds    the dataset that to be shown
     */
    async changeDataset( ds ) {

      // sometimes there might not be a dataset given
      if( ds === null ) {
        return;
      }

      if( this._store.has( ds ) ) {          // XXXXXXXXXXXXXXXXXXXXXXXX known entry

        // we know the dataset already
        const entry = this._store.get( ds );

        // track, if we found any change
        let changed = false;

        // has the referenced engine-dataset changed?
        if( entry.data_id == ds.getID() ) {

          // check viz settings
          if( ds.getVizSettings() != entry.viz ) {
            entry.viz = ds.getVizSettings();
            changed = true;
          }
  
          // check the view
          if( ds.getView() != entry.view ) {
            entry.view = ds.getView();
            changed = true;
          }
  
          // check alias
          if( ds.getAlias() != entry.alias ) {
            entry.alias = ds.getAlias();
            changed = true;
          }
          
        } else {

          // there is an entry we have to replace
          // remember that UI-datasets only represent shown entries and not engine datasets
          this._store.delete( ds );
          return this.addDataset( ds );
          changed = true;

        }

        // if something changed, we persist again
        if( changed ) {
          this._persist();
        }

      } else {                               // XXXXXXXXXXXXXXXXXXXXXXXX new tab

        // we can not associate this dataset, so it is probably new
        return this.addDataset( ds );

      }

    }


    /**
     * remove a dataset from the state
     *  @param   {Dataset}     ds   the dataset that to be removed
     */
    removeDataset( ds ) {

      // sometimes there might not be a dataset given
      if( ds === null ) {
        return;
      }

      // remove from state
      this._store.delete( ds );

      // persist the new state
      this._persist();

      // select a new active dataset
      // retrieve it from the dsNav as this has information about the UI state
      this._curDs = this._dsNav.getActive();

    }


    /**
     * try to restore a previous session
     */
    restore() {

      // try to get a previous session
      const raw = window.localStorage.getItem( STORAGE_ID );
      if( !raw ) {
        return false;
      }

      // attempt to load the data
      let data;
      try {
        data = JSON.parse( raw );
      } catch( e ) {
        // invalid data
        return false;
      }

      // if there is no session data, we are done
      if( !(data instanceof Array) || (data.length < 1 ) ) {
        return;
      }

      // open up restoration dialog
      Y.UIBroker.dialog( 'restoreSession', { data } );

      // there is something to restore
      return true

    }


    /**
     * start with a clean session and remove any old data
     */
    reset(){

      // remove from localStore
      try {
        window.localStorage.removeItem( STORAGE_ID );
      } catch( e ) {}

      // clean volatile store
      this._store = new Map();

    }

    /**
     * persist the current state
     * currently uses localStorage
     */
    _persist() {

      // persist in local storage
      try {
        window.localStorage.setItem( STORAGE_ID, JSON.stringify( [ ...  this._store.values() ] ) );
      } catch(e) {
        console.error( 'localStorage quota reached' );
      }

    }

  }

});