"use strict";
/**
 * load a workflow from file and execute it
 */
define( ['ui/basic/types/Dataset',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/execWorkflow.htm',
         'ui/dialog/Wrapper' ],
function(Dataset,
         Y,
         templ,
         DialogWrapper
         ){

  // dialog content
  const $content = $( templ );

  // link to input field(s)
  const $wfInput = $content.find( '#loadDataset_file' ),
        $wfShown = $content.find( '.fileInputPath' );

  // upon file selection, enable load button
  $wfInput.on( 'input', function(){

    if( this.files && (this.files.length > 0) ) {
      // enable load button
      dialog.setDisabled( 'Load', false );
    } else {
      // disable load button
      dialog.setDisabled( 'Load', true );
    }

  });

  /**
   * execute the given workflow
   */
  async function doExecute( wf ) {

    // request loading from engine
    const cmd = {
        'action': 'execWorkflow',
        'params': {
          'workflow': wf,
          'wfType':   'workflow',
        },
      };
    const msg = await Y.CommBroker.execCommand( cmd );

    // create respective dataset
    const ds = new Dataset( msg.params.data_id, 'data', cmd );

    // add dataset
    Y.UIBroker.addDataset( ds );

    // show in content view
    Y.UIBroker.showView( ds, 'data' );

  }

  // create dialog
  const dialog = new DialogWrapper( $content, {
    'buttons': [

      {
        text: 'Load',
        click: function(){

          // if there is a file given
          if( $wfInput.val() ) {

            // get the filename
            const file = $wfInput[0].files[0];

            // try to read the file
            const fr = new FileReader();
            fr.addEventListener( 'load', function(){

              try {

                // parse workflow
                const wf = JSON.parse( fr.result );

                // execute the workflow
                doExecute( wf );

              } catch( e ){

                throw new Error( 'Could not load workflow!' );

              }

            });
            fr.readAsText( file );

          }

          // close dialog
          dialog.close();

        }
      },

      {
        text:     'Cancel',
        'class':  'secondary',
        click:    () => dialog.close()
      }

    ],

    'close': function(){
      // clear value
      $wfInput.val( '' );
      $wfShown.val( '' );
    },

    'beforeOpen': function(){
      // disable load button
      dialog.setDisabled( 'Load' );
    },

  });


  // return wrapped version
  return dialog;
});