"use strict";
/**
 * dialog for filtering datasets
 */
define( ['basic/Constants',
         'jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/filter.htm',
         'ui/basic/Overlay',
         'ui/dialog/Wrapper',
         'util/requirePromise' ],
function( Constants,
          $,
          jqueryUI,
          Y,
          templ,
          Overlay,
          DialogWrapper,
          requireP
         ){

  // dialog content
  const $content = $( templ );

  // important elements
  const $el = {
      filterCont: $content.find( '.container' ),
  };

  // current set of parameters and the current filter dialog handler
  let curParams,
      curHandler;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': async function( params ){

      // save reference to params
      curParams = params;

      // mapping between column type and filter types
      let fType;
      switch( params['col'].getDatatype() ) {

        case Constants.DATATYPE.SEMANTIC:  fType = 'EntityFilter'; break;

        case Constants.DATATYPE.NUMERIC:   fType = 'NumberRangeFilter'; break;

        case Constants.DATATYPE.TIME:      fType = 'DateRangeFilter'; break;

        default: 'EntityFilter';

      }

      // get content for this dialog type
      const dialogContent = await requireP( 'ui/dialog/filter/' + fType );

      // create handler
      const handler = new dialogContent( dialog, $el.filterCont, params['ds'], params['col'] );

      // init content
      await handler.init();

      // store reference to handler
      curHandler = handler;

    },

    'buttons': [{
      'text': 'Apply',
      'click': async function(){

        // set processing button
        dialog.setProcessing( 'Apply' );

        // does the current filter have any effect?
        if( !curHandler.hasEffect() ) {
          dialog.close();
          return;
        }

        // get the filter rule
        const filter = curHandler.getFilterRule();

        // issue command
        await curParams['ds'].execCommand( 'filterData', {
          'filterDef': filter
        });

        // reenable buttons
        dialog.setProcessing();

        // close dialog
        dialog.close();

      }
    },{
      'text':   'Cancel',
      'class':  'secondary',
      'click':  () => dialog.close()
    }]

  });

});