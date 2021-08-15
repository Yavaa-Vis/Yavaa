"use strict";
define( [ 'ui/basic/Yavaa.global',
          'jquery',
          'config/ui/config',
          'ui/basic/Overlay',
          'util/requirePromise',
          'ui/polyfills',
          ],
function( Y,
          $,
          Config,
          Overlay,
          requireP
         ){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXX build interface XXXXXXXXXXXXXXXXXXXXXXXXXX */

  $( document ).ready( async function(){

    // add overlay while loading basic components
    const overlay = new Overlay( 'body' );

    // load basic modules
    const modules = await requireP([
                             'ui/broker/comm',      // add communication broker
                             'ui/broker/ui',        // add UI broker
                             'ui/broker/cmd',       // add command broker
                           ]);
    await Promise.all( modules.map( m => m ? m() : '' ) );

    // disable browser context menu
    if( !Config.enableNativeContextMenu ) {
      $( 'body > *:not(#info)' ).on( 'contextmenu', function(e){
        e.preventDefault();
        return false;
      });
    }

    // setup custom file inputs
    $( 'body' )
      .on( 'click', '.input.file button, .input.file input[readonly]', function(ev){
        $(this)
          .parent( '.input.file' )
          .find( 'input[type="file"]' )
          .trigger( 'click' );
      });
    $( 'body' )
      .on( 'change', '.input.file input[type="file"]', function(ev){
        const $this = $(this);
        $this
          .parent( '.input.file' )
          .find( '.fileInputPath' )
          .val( $this.val() )
          .trigger( 'input' );
      });

    // add global onerror handler: delegate to requirejs error handler
    $( window ).on( 'error', requirejs.onError );

    // remove overlay
    overlay.remove();

    // set ready flag on body element
    $( 'body' ).addClass( 'ready' );

    // trigger session restoration, if available
    Y.UIBroker.restoreSession();

  });
});