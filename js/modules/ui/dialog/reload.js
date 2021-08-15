"use strict";
/**
 * dialog for reloading the session after it timed out
 */
define( ['jquery',
         'jquery-ui',
         'text!template/ui/dialog/reload.htm',
         'ui/dialog/Wrapper'
         ],
function( $,
          jqueryUI,
          template,
          DialogWrapper
         ){

  // dialog content
  const $content = $( template );

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {

    'buttons': [{
      text:     'Reload Session',
      click:    () => {

        // set processing on the dialog
        dialog.setProcessing( 'Reload Session');

        // reload page
        window.location.reload();

      },
    }]

  });

});