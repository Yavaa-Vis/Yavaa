"use strict";
/*
 * attach the context menu for datatable columns
 */
define( [ 'config/ui/datatables.contextmenu',
          'ui/basic/Yavaa.global',
          'jquery',
          'jquery.ui-contextmenu',
        ],
function( menuCfg,
          Y,
          $
         ) {

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX prepare XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  const sym = {
      source:     Symbol.for( 'Source entry' ),
      shownFor:   Symbol.for( 'Menu entry shown for _ datatypes' ),
  };

  // create context menu for columns
  const ctxMenu = [],
        ctxMenuTypes = Object.keys( menuCfg.menus );
  for( let i=0; i<menuCfg.entries.length; i++ ) {

    // shortcut
    const entry = menuCfg.entries[i];

    // add menu item to global contextmenu
    const menuEntry = {
                        'title':        entry.label,
                        'cmd':          entry.id,
                        'uiIcon':       entry.classes || '',
                        'data':         entry,
                        [sym.source]:   entry,
                        [sym.shownFor]: new Set,
                      };
    ctxMenu.push( menuEntry );

    // add information, for which data types this entry is shown
    for( let j=0; j<ctxMenuTypes.length; j++ ) {
      if( menuCfg['menus'][ ctxMenuTypes[j] ].includes( entry.id ) ) {
        menuEntry[ sym.shownFor ].add( ctxMenuTypes[j] );
      }
    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX attach XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return function colCtxMenu( cont, el, ds, cols, table ) {

    // add context menu to head row
    const ctxMenuInstance = $( cont ).contextmenu({
      addClass:   'yavaa-colcontext',
      'delegate': el,
      'menu':     ctxMenu,
      'select': function(event, ui) {
        // open respective dialog

        // get associated entry
        const entry = ui.item.data();

        // get column index
        const colIndex = getColIndex( ui.target );

        // open respective dialog
        Y.UIBroker.dialog( entry.dialog, {
          'target':     ui.target,
          'colIndex':   colIndex,
          'col':        cols[ colIndex ],
          'command':    ui.cmd,
          'ds':         ds
        });

      },
      'beforeOpen': function( event, ui ) {
        // filter menu options based on column type

        // get column index
        const colIndex = getColIndex( ui.target );

        // get column type
        const colType = cols[ colIndex ].getDatatype();

        // sort entries according to config specification
        ctxMenu.sort( (a,b) => {
          return menuCfg['menus'][ colType ].indexOf( a.cmd ) - menuCfg['menus'][ colType ].indexOf( b.cmd );
        });
        ctxMenuInstance.contextmenu( "replaceMenu", ctxMenu );  // need to set the menu again; old array is not updated in plugin

        // process all entries
        ctxMenu
          .forEach( async (entry, ind) => {

            // is this entry shown?
            const isShown = entry[ sym.shownFor ].has( colType );

            // set show/hide
            ctxMenuInstance.contextmenu( 'showEntry', entry['cmd'], isShown );

            // if 'update' handler is given, execute it and set title
            if( isShown && ('update' in entry[ sym.source ]) ) {

              const title = await entry[ sym.source ].update( cols[ colIndex ] )
                            || entry.title;

              ctxMenuInstance.contextmenu( 'setEntry', entry['cmd'], title );

            }

          });

      }

    });


    /**
     * extract the column id from the clicked element or its parents
     * @param {HTMLElement}   target
     */
    function getColIndex( target ) {

      // get column object
      let $el = $( target ),
          col;
      while( $el && ($el.length > 0) ) {

        // get col
        col = $el.data( 'col' );

        // if found, return
        if( col ) {
          return col.getID();
        }

        // check parent
        $el = $el.parent();

      }

      // if this is a datatable, we might get an ID from its header information
      if( table ) {

        // column index in datatable
        const colIndex = table.cell( target ).index().column;

        // get the respective header
        const header = table.column( colIndex ).header();

        // get the column object
        col = $(header).data( 'col' );

        // return, if we found something
        if( col ) {
          return col.getID();
        }

      }

      // no column object => error
      throw new Error( 'Could not find column object' );

    }
  }
});