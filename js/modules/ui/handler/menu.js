"use strict";
/*
 * attach handlers to the top menu
 */
define( [ 'config/server',
          'ui/basic/Yavaa.global',
          'jquery',
          'config/ui/top.menu',
          'config/ui/dataset.contextmenu'
], function( ServerCfg,
             Y,
             $,
             ConfigTopMenu,
             ConfigDsMenu
){

  // shortcut to menu wrapper
  const $menuWrapper = $( '#menu' );

  // mark DS specific entries
  const dsMarker = Symbol.for( 'dataset specific menu entry' );
  ConfigDsMenu.entries.forEach( e => e[ dsMarker ] = true );

  // prepare menu item list
  let allEntries = ConfigTopMenu
                        .entries
                        .slice( 0 );
  allEntries.push( { 'id': '', 'label': '', 'classes': 'icon icon-separator', disabled: true } );
  allEntries.push( ... ConfigDsMenu.entries.filter( (el) => !el.contextmenuonly ) );
  allEntries = allEntries.filter( (entry) => !ServerCfg.isProduction || !entry.hideInProd );

  // insert menu items
  const $menuItems = [];
  for( let item of allEntries ) {

    // create element
    const $domItem = $( '<div />' );
    $menuItems.push( $domItem );

    // add classes and title
    $domItem.addClass( 'menuitem ' + item.classes );
    $domItem.attr( 'title', item.label );

    // remember dialog to execute
    if( item.dialog ) {
      $domItem.data( 'command', item.dialog );
    }

    // is this item disabled?
    if( item.disabled ) {
      $domItem.addClass( 'disabled' );
    }

    // dataset specific entries
    if( item[ dsMarker ] ) {
      $domItem.addClass( 'disabled' );
      $domItem.attr( 'data-dsspec', 'true' );
    }

  }

  // append menu items
  $menuWrapper.append( $menuItems );


  // add click handler
  $menuWrapper.on( 'click', '.menuitem', function(){

    // jquery wrapped element
    const $this = $(this);

    // do nothing, if this option is currently disabled
    if( $this.hasClass( 'disabled') ) {
       return;
    }

    // get the command to execute
    const command = $this.data( 'command');

    // determine action
    const ds = Y.UIBroker.getActiveDataset();
    switch( command ) {

      case 'undo':
        ds && ds.undo();
        break;

      case 'redo':
        ds && ds.redo();
        break;

      default:
        // open the dialog
        Y.UIBroker.dialog( command,{
          'target': this,
          'ds':     ds,
        } );

    }

  });

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Exports XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  const $els = {
    undo:     $( '#menu .undo' ),
    redo:     $( '#menu .redo' ),
    dsSpec:   $( '#menu .menuitem[data-dsspec]' ),
  };

  /**
   * enable/disable the undo and redo button
   */
  function setDo( doType, state ) {
    let $el;
    switch( doType.toLowerCase() ) {
      case 'undo': $el = $els.undo; break;
      case 'redo': $el = $els.redo; break;
    }
    $el[ !!state ? 'removeClass' : 'addClass' ]( 'disabled' );
  }


  /**
   * enable or disable all dataset specific entries
   */
  function setDsSpecific( state ) {
    $els.dsSpec[ !!state ? 'removeClass' : 'addClass' ]( 'disabled' );
  }

  /**
   * export some utility functions
   */
  return {
    setDsSpecific: setDsSpecific,
    setDo:         setDo,
  };

});