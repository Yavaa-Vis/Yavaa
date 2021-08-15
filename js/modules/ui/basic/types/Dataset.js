"use strict";
define( [ 'ui/basic/Yavaa.global',
          'ui/basic/types/Column'
        ],
function(  Y,
           Column
         ){

  /*
   * encapsulate all information about a (UI) dataset
   * this is not (!) equivalent to an engine dataset!
   *
   * includes information:
   * - current selected view for dataset
   * - current data_ud
   * - current settings for visualization
   * - workflow history: given by previous (engine) data_id entries
   */

  // TODO workflow history

  // remember which data_id maps to which Dataset object
  const map = [];

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Constructor XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function Dataset( data_id, view, command ){

    // new Dataset object
    this.data_id            = data_id;
    this.view               = view;
    this.vizSettings        = null;
    this.rerenderRequested  = true;
    this.history            = [{ 'data_id': data_id, 'cmd' : command }];
    this.alias              = 'dataset ' + (map.length + 1);

    // entry to map
    map[ data_id ] = this;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getById XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  Dataset.getById = function getById( id ) {
    return map[ id ];
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX view XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  Dataset.prototype.setView = function setView( view ) {
    this.view = view;
  };

  Dataset.prototype.getView = function getView() {
    return this.view;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX data_id XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * @deprecated
   */
  Dataset.prototype.getID = function getID() {
    return this.data_id;
  };

  /**
   * get the data_id of the current revision for this dataset
   * @returns
   */
  Dataset.prototype.getDataID = function getDataID() {
    return this.data_id;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX viz settings XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /*
   * serialized to prevent accidental manipulation
   */

  Dataset.prototype.setVizSettings = function setVizSettings( settings ) {
    this.vizSettings = settings;
    this.requestVizRerender();
  };

  Dataset.prototype.getVizSettings = function getVizSettings( ) {
    return this.vizSettings;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Rerender XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /*
   * request visualization rerender, if the dataset content has changed
   */

  Dataset.prototype.requestVizRerender = function requestVizRerender() {
    this.rerenderRequested = true;
  };

  Dataset.prototype.needsRerender = function needsRerender() {
    return this.rerenderRequested;
  };

  Dataset.prototype.didRerender = function didRerender() {
    this.rerenderRequested = false;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Revisions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * add a new revision to this dataset
   */
  Dataset.prototype.addRevision = async function addRevision( prevData_id, data_id, command ) {

    // find the position of the previous version in the history
    const index = this.history.findIndex( (el) => el.data_id == prevData_id );

    // delete all entries after the previous one
    this.history.length = index + 1;

    // add the new history entry
    this.history.push( {'data_id': data_id, 'cmd': command } );

    // change current data_id
    this.data_id = data_id;

    // clear meta cache
    const oldMeta = await this.getColumnMeta();
    this._meta = null;

    // entry to map
    map[ data_id ] = this;

    // validate viz settings, if already set
    // TODO seems like a hack, could probably be more clear
    if( this.vizSettings ) {

      // get the new (column) meta data
      const newMeta = await this.getColumnMeta();

      // create a map sourcePos -> newPos
      const posMap = newMeta.reduce( (all, col) => {
        const sourcePos = col.getAttribute( '_sourcePos' );
        if( typeof sourcePos == 'number' ) {
          all[ sourcePos ] = col.getID();
        }
        return all;
      }, {} );

      // update the vizSettings
      const keys = Object.keys( this.vizSettings ),
            newSettings = {};
      for( let key of keys ) {
        if( this.vizSettings[ key ] instanceof Number ) {

          // single bindings
          if( !(this.vizSettings[ key ] in posMap) ) {
            this.vizSettings = null;
            return;
          }
          newSettings[ key ] = posMap[ this.vizSettings[ key ] ];

        } else if ( this.vizSettings[ key ] instanceof Array ) {

          // multi bindings
          newSettings[ key ] = [];
          for( let val of this.vizSettings[ key ] ) {
            if( !(val in posMap) ) {
              this.vizSettings = null;
              return;
            }
            newSettings[ key ].push( posMap[ val ] );
          }

        } else {

          // something is wrong, reset the settings
          this.vizSettings = null;
          return;

        }
      }
      this.vizSettings = newSettings;

    }

  }

  /**
   * check, if the given dataset is within the history of this dataset
   */
  Dataset.prototype.isRevision = function isRevision( other ) {
    const otherDsId = other.getID();
    return this.history.some( (h) => h.data_id == otherDsId );
  }


  /**
   * change to the previous item in the history list
   */
  Dataset.prototype.undo = function undo() {

    // find the current entry within the history
    let index = this.history.findIndex( (el) => el.data_id == this.data_id );

    // we can not go before the first action
    if( index <= 0 ) {
      return;
    }

    // we need one version before
    index -= 1;

    // activate that version
    this.data_id = this.history[ index ].data_id;

    // clear meta cache
    this._meta = null;

    // ... and show it in content view
    Y.UIBroker.showView( this, true );

  }


  /**
   * change to the next item in the history list
   */
  Dataset.prototype.redo = function redo() {

    // find the current entry within the history
    let index = this.history.findIndex( (el) => el.data_id == this.data_id );

    // we can not go past the last action
    if( index >= this.history.length - 1 ) {
      return;
    }

    // we need one version after
    index += 1;

    // activate that version
    this.data_id = this.history[ index].data_id;

    // clear meta cache
    this._meta = null;

    // ... and show it in content view
    Y.UIBroker.showView( this, true );

  }


  /**
   * can we perform an undo command on this dataset?
   */
  Dataset.prototype.canUndo = function canUndo() {

    // find the current entry within the history
    const index = this.history.findIndex( (el) => el.data_id == this.data_id );

    return index > 0;

  }


  /**
   * can we perform a redo command on this dataset?
   */
  Dataset.prototype.canRedo = function canRedo() {

    // find the current entry within the history
    const index = this.history.findIndex( (el) => el.data_id == this.data_id );

    return index < this.history.length - 1;

  }


  /**
   * return the predecessor for this dataset
   */
  Dataset.prototype.getPrevious = function getPrevious() {

    // find the index of the current entry within the history
    const index = this.history.findIndex( (el) => el.data_id == this.data_id );

    if( index > 0 ) {
      return this.history[ index - 1 ].data_id;
    } else {
      return null;
    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Alias XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  Dataset.prototype.getAlias = function getAlias() {
    return this.alias;
  }

  Dataset.prototype.setAlias = function setAlias( alias ) {
    this.alias = alias;
    return this;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dataset Meta XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return the metadata for this dataset
   */
  Dataset.prototype.getMeta = async function getMeta(){

    if( this._meta ) {

      // cache hit
      return this._meta;

    } else {

      // retrieve meta
      const res = await Y.CommBroker
                        .execCommand({
                            'action': 'getMeta',
                            'params': { 'data_id': this.getDataID() }
                         });

      // cache meta
      this._meta = res['params'];

      // return meta
      return this._meta;

    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Column Meta XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return the meta data for the columns of this dataset
   */
  Dataset.prototype.getColumnMeta = async function getColumnMeta(){

    if( this._meta ) {

      // cache hit

      // columns already parsed?
      if( !('columns' in this._meta) ) {

        // create Column objects
        this._parseColumns();

      }

      return this._meta['columns'];

    } else {

      // retrieve meta
      const res = await Y.CommBroker
                          .execCommand({
                              'action': 'getMeta',
                              'params': { 'data_id': this.getDataID() }
                           });

      // cache meta
      this._meta = res['params'];

      // create Column objects
      this._parseColumns();

      // return column meta
      return this._meta['columns'];

    }

  }


  /**
   * parse the column metadata into the respective objects
   */
  Dataset.prototype._parseColumns = function _parseColumns(){

    // prepare holding array
    this._meta['columns'] = [];

    // get meta
    const c = this._meta['meta']['columns'];

    // create objects
    for( var i=0; i<c.length; i++ ){
      this._meta['columns'].push( new Column( this, c[i] ) );
    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX execCommand XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * execute a command on this dataset
   * @param   {String}    cmd                 the command to be issued
   * @param   {Object*}   params              the command's parameters
   * @param   {Boolean=}  anonymousCommand    is this command anonymous?
   * @returns {Object*}                       the raw response from the worker
   */
  Dataset.prototype.execCommand = async function execCommand( cmd, params, anonymousCommand ) {

    // augment with current data_id
    if( !anonymousCommand ) {
      params['data_id'] = this.getDataID();
    }

    // build command
    const command = {
      'action': cmd,
      'params': params
    };

    // execute command
    const res = await Y.CommBroker.execCommand( command )

    // if the result is a new dataset ...
    if( ('params' in res) && ('data_id' in res['params'])) {

      // ... if there was a dataset change ...
      if( params['data_id'] != res['params']['data_id'] ) {

        // ... save it as new revision ...
        await this.addRevision( params['data_id'], res['params']['data_id'], command );

      }

      // ... by default we need a re-render of the visualization in any case
      this.requestVizRerender();

      // ... and show it in content view
      Y.UIBroker.showView( this, true );

    }

    // relay result
    return res;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX EXPORT XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return Dataset;

});