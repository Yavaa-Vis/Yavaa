"use strict";
/**
 * confirmation dialog to drop a dataset from UI
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/dropDataset.htm',
         'text!template/ui/common/dataset.htm',
         'ui/dialog/Wrapper' ],
function($,
         jqueryUI,
         Y,
         templ,
         templDs,
         DialogWrapper ){

  // dialog content
  const $content = $( templ );

  // reference to current set parameters, if present
  let curParams = null;

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': function( params ){

      // save reference to params
      curParams = params;

      // shortcut
      const ds = params['ds'];

      // prepare the column DOM elemnt
      const dsEl = templDs.replace( /{uri}/gi,   '' )
                          .replace( /{label}/gi, ds.getAlias() );

      // insert to the DOM
      $content.find( '.ds' ).html( dsEl );

    },

    'buttons': [{
        'text': 'Drop',
        'click': async function(){

          // set processing button
          dialog.setProcessing( 'Apply' );

          if( curParams != null ) {

            // issue command
            await Y.UIBroker.removeDataset( curParams['ds'] );

          } else {
            throw Error( 'Missing parameters for dropDataset' );
          }

          // reenable buttons
          dialog.setProcessing();

          // close dialog
          dialog.close();

        }
      },{
        'text': 'Cancel',
        'class': 'secondary',
        'click': () => dialog.close()
      }]

  });

});