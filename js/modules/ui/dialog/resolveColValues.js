"use strict";
/**
 * trigger the name resolving for semantic columns
 */
define( ['jquery',
         'jquery-ui',
         'basic/Constants',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/resolveColValues.htm',
         'text!template/ui/dialog/resolveColValues/item.htm',
         'text!template/ui/dialog/resolveColValues/noItems.htm',
         'ui/dialog/Wrapper' ],
function($,
         jqueryUI,
         Constants,
         Y,
         templ,
         templItem,
         templNoItems,
         DialogWrapper ){

  // dialog content
  const $content = $( templ );

  // reference to current set parameters, if present
  let curParams = null;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX Click Handler XXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  $content.find( '[data-select]' )
          .on( 'click', function(){

            // get mode
            const mode = $(this).data('select') == 'all';

            // change all inputs accordingly
            $content.find( '.items input' )
                    .prop( 'checked', mode );

          });

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': async function( params ){

      // save reference to params
      curParams = params;

      // shortcut
      const ds      = params['ds'],
            cols    = await ds.getColumnMeta(),
            semCols = cols.filter( (col) => col.getDatatype() == Constants.DATATYPE.SEMANTIC );

      if( semCols.length > 0 ) {

        // add input for each column
        const items = [];
        for( let i=0; i<semCols.length; i++ ) {

          // shortcut
          const colId = semCols[i].getID();

          // create item
          let item = templItem.replace( '{col_id}',   colId )
                              .replace( '{title}',    semCols[i].getLabel() )
                              .replace( '{checked}',  (colId == params['colIndex']) ? 'checked' : '' );

          // add to collection
          items.push( item );

        }

        // add to dialog
        $content.find( '.items' ).html( items.join('') );

        // make sure resolve button is enabled
        dialog.getButton( 0 ).prop( 'disabled', false );

      } else {

        // add show "none available"-message
        $content.find( '.items' ).html( templNoItems );

        // disable resolve button
        dialog.getButton( 0 ).prop( 'disabled', true );

      }

    },

    'buttons': [
      {
        text:   'Resolve',
        click:  function(){

          // disable buttons and set to processing
          dialog.getButtons().prop( 'disabled', true );
          dialog.getButton( 0 ).attr( 'data-processing', '' );

          // get list of selected columns
          const selected = $content.find( '.items li input:checked' )
                                  .map( function( ind, el ) {
                                      return $(el).data( 'colId' );
                                  })
                                  .get();

          if( selected.length > 0 ) {

            // issue command
            curParams['ds']
              .execCommand( 'resolveColValues', {
                'columns': selected
              })
              .catch( (e) => {
                // something went wrong, but dialog should be shown before
                console.log(e);
              })
              .then( () => {

                // reenable buttons and remove processing
                dialog.getButtons().prop( 'disabled', false );
                dialog.getButton( 0 ).removeAttr( 'data-processing' );

                // close the dialog
                dialog.close();

              });

          } else {

            // nothing selected, so just close
            dialog.close();

          }

        }
      },

      {
        text:     'Cancel',
        'class':  'secondary',
        click:    function(){

          // just close the dialog
          dialog.close();

        }
      }
    ]

  });

});