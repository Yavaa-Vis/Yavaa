"use strict";
/**
 * dialog for restoring previous sessions
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'basic/Constants',
         'ui/basic/types/Dataset',
         'text!template/ui/dialog/restoreSession.htm',
         'text!template/ui/common/dataset.htm',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Y,
          Constants,
          Dataset,
          templ,
          templDataset,
          DialogWrapper
         ){

  // dialog content
  const $content = $( templ );

  // template items
  const $templ = {
      entry:  $content.find( '#restoreSessionEntry' ).contents(),
  }

  // change handler for inputs
  $content.find( '#restoreSessionList' )
          .on( 'input', 'input', function(){

            // is any of the inputs checked?
            const checked = $content.find( '#restoreSessionList input:checked' ).length > 0;

            // disable/enable restore button
            dialog.setDisabled( 0, !checked );

          });

  /**
   * prepare the dialog:
   * - add all previous datasets to the list to chose from
   */
  function setupDialog( param ){

    // shortcut
    const data = param.data;

    // build entries for all detected datasets
    const dslist = data.map( (ds) => {

      // get element
      const $el = $templ.entry.clone( true );

      // build dataset tag
      const tag = templDataset.replace( /{uri}/gi, '' )
                              .replace( /{label}/gi, ds.alias );

      // stitch it together
      $el.find( '.label' ).html( tag );

      // attach the data object
      $el.find( '.input' ).data( 'ds', ds );

      return $el;

    });

    // add to dialog
    $content.find( '#restoreSessionList' ).html( '' ).append( dslist );

    // disable restore button for now
    dialog.setDisabled( 0 );

  }


  /**
   * restore the checked datasets
   */
  async function restore(){

    // disable all inputs and start processing
    dialog.setProcessing( 0 );
    $content.find( '#restoreSessionList input' ).prop( 'disabled', true )

    // reset the state
    Y.UIBroker.resetState();

    // run the workflows and add the datasets
    const reqs = $content.find( '#restoreSessionList input:checked' )
                  .map( async ( ind, el ) => {

                    // get container and data entry
                    const $container = $(el).closest( '.input' ),
                          entry      = $container.data( 'ds' );

                    // execute workflow
                    const cmd = {
                        'action': 'execWorkflow',
                        'params': {
                          'workflow': entry.wf,
                          'wfType':   'workflow',
                        },
                      };
                    const msg = await Y.CommBroker.execCommand( cmd );

                    // create respective dataset
                    const ds = new Dataset( msg.params.data_id, entry.view, cmd );

                    // set alias and vizsettings, if available
                    ds.setAlias( entry.alias );
                    if( ('viz' in entry) && entry.viz ) {
                      ds.setVizSettings( entry.viz );
                    }

                    // add to UI
                    Y.UIBroker.addDataset( ds );

                    return { ds, entry };

                  });

    // wait for everything to finish
    const dslist = await Promise.all( reqs );

    // use the last dataset to show something
    const shown = dslist[ dslist.length - 1 ];
    Y.UIBroker.showView( shown.ds, shown.entry.view );

    // close the dialog
    dialog.close();

  }


  /**
   * don't restore the old session, but start on a clean slate
   */
  function skip(){

    // reset the state
    Y.UIBroker.resetState();

    // close dialog
    dialog.close();

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {

    'beforeOpen': setupDialog,

    'buttons': [{
      text:     'Restore',
      click:    restore,
    },{
      text:     'Skip',
      'class':  'secondary',
      click:    skip,
    }]

  });

});