"use strict";
/*
 * implements the navigation between different datasets
 */
define( [ 'config/server',
          'jquery',
          'ui/basic/Yavaa.global',
          'config/ui/dataset.contextmenu',
          'text!template/ui/dsNav/item.htm',
          'text!template/ui/dsNav/newItem.htm'
        ],
function( ServerCfg,
          $,
          Y,
          menuCfg,
          templItem,
          templNewItem
         ){

  // prepare context menu
  const ctxMenu = [];
  for( const entry of menuCfg.entries ) {

    // some are hidden in prod
    if( ServerCfg.isProduction && entry.hideInProd ) {
      continue;
    }

    // add menu item to global contextmenu
    ctxMenu.push({
      'title':  entry.label,
      'cmd':    entry.id,
      'uiIcon': entry.classes || '',
      'data':   entry,
    });

  }

  /*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX CONSTRUCTOR XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function dsNav( target ){

    // save link to target
    this._$target = $(target);

    // create "add" button
    this._$addBtn = $( templNewItem );
    this._$target.append( this._$addBtn );
    this._$addBtn.click( function(){
      Y.UIBroker.dialog( 'loadDataset' );
    });

    // mapping from dataset to entry in menu bar
    this._map = new Map();

    // active element
    this._active = null;

    // context menu
    const ctxMenuInstance = this._$target.contextmenu({
        'delegate': ".dsNavItem:not(.dsNavNewItem)",
        'menu': ctxMenu,
        'select': function(event, ui) {
          // open respective dialog

          // get dataset container
          const dsCont = ui.target.is( '.dsNavItem' ) ? ui.target : ui.target.parent( '.dsNavItem');

          // get associated entry
          const entry = ui.item.data(),
                ds    = dsCont.data( 'dataset' );

          if( 'dialog' in entry ) {

            // open respective dialog
            Y.UIBroker.dialog( entry.dialog, {
              'target': ui.target,
              'ds':     ds,
            });

          } else {

            // change view
            Y.UIBroker.showView( ds, entry.view )

          }

        }
    });
  }


  /*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX setActive XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /*
   * set a particular dataset as the active one
   * @param {Object}  ds    the newly active dataset
   */
  dsNav.prototype.setActive = function setActive( ds ) {

    // get entry
    const entry = this._map.get( ds );
    if( entry ) {

      // just change, if it has not been active before
      if( entry != this._active ) {

        // clear old active element
        this._active && this._active.removeClass( 'active' );

        // set new active element
        entry.addClass( 'active' );
        this._active = entry;

      }
    } else {
      throw new Error( 'Unknown dataset' );
    }

  };


  /**
   * get the currently active dataset (-tab)
   * @returns {Dataset}
   */
  dsNav.prototype.getActive = function getActive(){
    if( this._active ) {
      return this._active.data( 'dataset' );
    } else {
      return null;
    }
  }

  /*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX remove XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /*
   * remove the entry for a particular dataset
   * @param {Object} ds     the dataset to be removed
   */
  dsNav.prototype.remove = function remove( ds ) {

    // get entry
    const entry = this._map.get( ds );
    if( entry ) {

      // if entry was currently active, we have to switch somewhere else
      if( entry == this._active ) {

        // attempt to get the previous dataset
        const prev = entry.prev();

        if( prev.length > 0 ) {

          // there is a predecessor, so we set that one active
          const newDs = prev.data( 'dataset' );
          this.setActive( newDs );

        } else {

          // no other dataset, so we need to trigger cleanup
          this._active = null;
          Y.UIBroker.resetViews();

        }

      }

      // remove from UI and store
      entry.remove();
      this._map.delete( ds );

      // if no more entries are there, disable dataset specific buttons
      if( this._map.size < 1 ) {
        Y.UIBroker.disableDsSpecificMenu();
      }
    }

  };


  /*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX add XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /*
   * add a new dataset to the navigation
   * @param {Object} ds     the dataset to be added
   */
  dsNav.prototype.add = function add( ds ) {

    // create new entry
    const entry = $( templItem );

    // insert into map
    this._map.set( ds, entry );

    // update name
    entry.find( '.val' )
         .text( ds.getAlias() );

    // save link to dataset object
    entry.data( 'dataset', ds );

    // add classes
    entry.addClass( 'clickable' );

    // add click-handler
    entry.on( 'click', function(){
      Y.UIBroker.showView( ds, ds.getView() || 'data' );
    });

    // add doubleclick-handler
    entry.on( 'dblclick', editName );

    // add handlers to context menu
    entry.on( 'click', '.context .icon-renameDs', editName );
    entry.on( 'click', '.context .icon-dropDs', function(){

      // shortcut
      const $target = $( this ).closest( '.dsNavItem' );

      // open confirmation dialog
      Y.UIBroker.dialog( 'dropDataset', {
        'ds': $target.data( 'dataset' ),
      });

    });

    // append in DOM
    entry.insertBefore( this._$addBtn );

  };

  /*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX list XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * get a list of all currently active datasets
   */
  dsNav.prototype.list = function list() {

    return [ ... this._map.keys() ];

  }

  /*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX editName XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function editName() {

    // shortcut
    const $target = $( this ).closest( '.dsNavItem' ),
          $targetVal = $target.find( '.val' );

    // create an input box
    const $inp = $( '<input />' );

    // set the respective size
    $inp.height( $targetVal.height() );
    $inp.width(  $targetVal.width() + 10 ); // input fields are slightly larger

    // set the content
    const ds = $target.data( 'dataset' );
    $inp.val( ds.getAlias() );

    // remember old target
    $inp.data( 'baseElement', $target );

    // attach finished handler
    $inp.on( 'blur', finishedEditName );
    $inp.on( 'keypress', function(e) {
      if (e.keyCode == 13) {
        ( finishedEditName.bind( this ) )();
          return false;
      }
    });

    // display
    $targetVal.after( $inp );
    $targetVal.hide();

    // focus
    $inp.focus();

  }

  // "finished" handler
  function finishedEditName() {

    // shortcuts
    const $this = $( this ),
          $target = $this.data( 'baseElement' ),
          $targetVal = $target.find( '.val' );

    // remember new alias
    const ds = $target.data( 'dataset' );
    ds.setAlias( $this.val() );

    // reset value
    $targetVal.text( ds.getAlias() );

    // swap in DOM
    $targetVal.show();
    $this.remove();

  }

  /*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX EXPORT XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  return dsNav;

});