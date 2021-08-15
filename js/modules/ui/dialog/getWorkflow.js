"use strict";
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/getWorkflow.htm',
         'ui/basic/Overlay',
         'ui/dialog/Wrapper' ],
function($,
         jqueryUI,
         Y,
         templ,
         Overlay,
         DialogWrapper
         ){

  /*
   * load a new dataset dialog
   */

  // dialog content
  const $content = $( templ );

  // link to elements
  var $els = {
      content: $content.find( '#workflow_content' )
  };

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': async function( params ) {

      // clear old value
      $els.content.html( '' );

      // create overlay
      const overlay = new Overlay( $content );

      // query for workflow
      const msg = await params['ds'].execCommand( 'getWorkflow',{
                                      'format': 'JSON'
                                    });

      // shortcut
      const wf = JSON.parse( msg['params']['workflow'] );

      // insert to dialog
      $els.content.text( JSON.stringify( wf, null, '  ' ) );

      // remove overlay
      overlay.remove();

      // reposition dialog
      dialog.resize();;

    },

    'buttons': [{
      'text':   'Close',
      'class':  'secondary',
      'click':  () => dialog.close(),
    }]

  });

});