"use strict";
/**
 * manage the visualisation view
 */
define( [
          'ui/basic/Yavaa.global',
          'jquery',
          'ui/basic/Overlay',
          'util/requirePromise',
          ],
function( Y,
          $,
          Overlay,
          requireP
         ){

  // currently shown dataset
  let curDatasetID    = -1,
      curVizSettings  = {};

  /**
   * show the visualization chosen for the given dataset
   */
  async function showViz( target, ds, forceUpdate ) {

    // target element
    const $target = $( target );

    // get the datasets visualization settings
    const settings = ds.getVizSettings();

    // if no visualization has been selected so far, reset the view
    if( !settings ) {

      // retrieve placeholder template
      const placeholder = await requireP( 'text!template/ui/views/viz/noselection.htm' );

      // insert placeholder to output
      $target.html( placeholder );

      // attach dialog handler
      $target.find( '[data-dialog]' ).on( 'click', function(){

        // shortcut
        const $this = $(this);

        // open dialog
        Y.UIBroker.dialog( $this.data('dialog'), {
          'ds': ds
        });

      });

      return;
    }

    // skip, if nothing has changed and we were not forced to update
    if( !forceUpdate && (curDatasetID == ds.getDataID()) && !ds.needsRerender() ) {
      return;
    }

    // save new status
    curDatasetID    = ds.getDataID();
    curVizSettings  = settings;

    // set overlay
    $target.html( '' );
    const overlay = new Overlay( $target );

    // retrieve a new visualization
    const msg = await Y.CommBroker
                      .execCommand({
                          'action': 'getStaticSVG',
                          'params': {
                            'data_id': ds.getDataID(),
                            'type':    settings.type,
                            'options': settings.options
                          }
                      });

    // remove Overlay
    overlay.remove();

    // insert the code
    $target.html( msg.params.code );

    // memorize we rendered this dataset
    ds.didRerender();

  }


  /**
   * reset the viz view
   */
  async function resetViewViz( target ) {

    // reset state
    curDatasetID    = -1;
    curVizSettings  = {};

    // reset HTML
    $( target ).empty();

  }


  return { show: showViz, reset: resetViewViz };

});