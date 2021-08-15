"use strict";
/**
 * manually compose a query to the engine
 */
define( ['ui/basic/types/Dataset',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/composeCommand.htm',
         'ui/dialog/Wrapper' ],
function( Dataset,
          Y,
          templ,
          DialogWrapper
         ){

  // dialog content
  const $content = $( templ );

  // link to elements
  const $els = {
      action: $content.find( '#composeCommand_action' ),
      params: $content.find( '#composeCommand_params' ),
      msg:    $content.find( '#composeCommand_message' )
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Submitting XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  async function submitCommand(){

    // there has to be a action
    const action = $els.action.val().trim();
    if( action == '' ) {
      $els.msg.text( 'You have to select an action!' );
      return;
    }

    // there has to be a valid params object
    let param = $els.params.val().trim();
    try{
      param = JSON.parse( param );
    } catch( e ) {
      $els.msg.text( 'You provided an invalid params object!' );
      return;
    }

    // status message
    $els.msg.text( '' );

    // set processing button
    dialog.setProcessing( 'Send' );

    // send command
    const cmd = {
        'action': action,
        'params': param
      };
    const msg = await Y.CommBroker.execCommand( cmd );

    // if the result is a dataset, show it
    if( ('params' in msg) && ('data_id' in msg.params) ) {

      // create respective dataset
      const ds = new Dataset( msg.params.data_id, 'data', cmd );

      // add dataset
      Y.UIBroker.addDataset( ds );

      // show in content view
      Y.UIBroker.showView( ds, 'data' );

    }

    // reenable buttons
    dialog.setProcessing();

    // close dialog
    dialog.close();

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // return wrapped version
  const dialog = new DialogWrapper( $content, {
    'buttons': [

      {
        text: 'Send',
        click: submitCommand,
      },

      {
        text:  'Cancel',
        class: 'secondary',
        click: function(){

          // reset message
          $els.msg.text('');

          // close dialog
          dialog.close();

        }
      },

    ]
  });
  return dialog;

});