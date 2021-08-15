"use strict";
/**
 * show workflow
 */
define([
          'ui/basic/Yavaa.global',
          'jquery',
          'ui/views/_common/colCtxMenu'
       ],
function(
          Y,
          $,
          colCtxmenu
       ){

  async function showWF( target, ds, forceUpdate ) {

    // shortcut
    const $target = $(target);

    // request workflow image
    const result = await Y.CommBroker.execCommand({
                                  'action': 'getWorkflow',
                                  'params': {
                                    'data_id':        ds.getID(),
                                    'format':         'viz',
                                    'includeStyles':  false,
                                  }
                                });

    // insert svg to DOM
    const svg = result.params.workflow;
    $target.html( svg );

    // get column meta
    const cols = await ds.getColumnMeta();

    // attach col objects to respective items
    $target.find( '[data-col]' )
            .each( function( ind, el ){

              // shortcut
              const $this = $( el );

              // attach
              $this.data( 'col', cols[ $this.data('col' ) ] );

            });

    // attach context menu
    colCtxmenu( target, 'g[data-col]', ds, cols );

  }


  /**
   * reset the workflow view
   */
  async function resetViewWF( target ){
    $( target ).empty();
  }

  return { show: showWF, reset: resetViewWF };

});