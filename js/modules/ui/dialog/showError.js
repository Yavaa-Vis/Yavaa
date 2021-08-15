"use strict";
/**
 * dialog for showing an error
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/showError.htm',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Y,
          templ,
          DialogWrapper
         ){

  // dialog content
  const $content = $( templ );

  // link to elements
  var $els = {
      src:    $content.find( '#src' ),
      msg:    $content.find( '#msg' ),
      stack:  $content.find( '#stack' ),
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': function( param ){

      // shortcut
      let err = param['error'];

      // wrap error, if we just get a string here
      if( typeof err == 'string' ) {
        err = new Error( err );
      }

      // find the actual error object (jQuery hides it somewhat)
      if( 'originalEvent' in err ) {
        err = err.originalEvent;
      }
      if( 'error' in err ) {
        err = err.error;
      }

      // set all values
      if( err instanceof Error ) {

        // JS error object
        $els.src.text( err.fileName );
        $els.msg.text( err.message );

        // stack
        if( err.stack != '' ) {
          $els.stack.text( err.stack );
        } else {
          // create a custom stack
          $els.stack.text( `in ${err.fileName} @ line ${err.lineNumber} column ${err.columnNumber}` );
        }

      } else {

        // insert linebreaks to msg
        const msg =  err.msg.replace(/(?:\r\n|\r|\n)/g, '<br />');

        // custom error object
        $els.src.text( err.src );
        $els.msg.html( msg );
        $els.stack.text( err.stack || '' );

      }

    },

    'buttons': [{
      text:     'Close',
      'class':  'secondary',
      click:    () => dialog.close()
    }]

  });

});