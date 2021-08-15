"use strict";
/**
 * confirmation dialog to delete a column
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/dropColumn.htm',
         'text!template/ui/common/column_dim.htm',
         'text!template/ui/common/column_meas.htm',
         'ui/dialog/Wrapper' ],
function($,
         jqueryUI,
         Y,
         templ,
         templCol_dim,
         templCol_meas,
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
      const col = params['col'];

      // prepare the column DOM elemnt
      let colEl;
      if( col.isDimension() ) {
        colEl = templCol_dim;
      } else {
        colEl = templCol_meas;
      }
      colEl = colEl.replace( /{uri}/gi,   col.getConcept() )
                   .replace( /{order}/gi, col.getID() )
                   .replace( /{label}/gi, col.getLabel() );

      // insert to the DOM
      $content.find( '.col' ).html( colEl );

    },

    'buttons': [{
        'text': 'Apply',
        'click': async function(){

          // set processing button
          dialog.setProcessing( 'Apply' );

          if( curParams != null ) {

            // issue command
            await curParams['ds'].execCommand( 'dropColumns', {
              'columns': [ curParams['col'].getID() ]
            });

          } else {
            throw Error( 'Missing parameters for dropColumns' );
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