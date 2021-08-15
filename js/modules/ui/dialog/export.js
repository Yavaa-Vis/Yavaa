"use strict";
/**
 * export the result
 *
 * things to be exported
 * - data
 * - workflow
 * - workflow viz
 * - viz
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/export.htm',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Y,
          templ,
          DialogWrapper
         ){

  // dialog content
  const $content = $( templ ),
        $inputs = $content.find( 'input' ),
        $link = $('<a>Download</a>');

  // append download link to dialog
  $link.css( 'display', 'none' );
  $content.append( $link );

  // current parameters
  let curParams;

  /**
   * trigger the download
   * - get requested type
   * - request resource
   * - provide download for resource
   */
  async function triggerDownload(){

    // set export button to processing
    dialog.setProcessing( 0, true );

    // get selected mode and get the values
    const $selected = $inputs.filter( ':checked' ).eq(0),
          part = $selected.data( 'part' ),
          mime = $selected.data( 'mime' );

    // retrieve content to be downloaded
    const response = await Y.CommBroker
                            .execCommand({
                              'action': 'export',
                              'params': {
                                'data_id': curParams.ds.getDataID(),
                                'part':    part,
                                'mime':    mime,
                                'visoptions': curParams.ds.getVizSettings(),
                              }
                            }),
          content = response.params.data;

    // build object url
    const blob = new Blob( [ content ], { type: mime } ),
          blobURL = URL.createObjectURL( blob );

    // prepare download link and trigger download
    $link.attr( 'href', blobURL );
    let filename = curParams.ds.getAlias();
    switch( mime ) {
      case 'text/tab-separated-values': filename += '.tsv'; break;
      case 'application/json':          filename += '.json'; break;
      case 'image/svg+xml':             filename += '.svg'; break;
    }
    $link.attr( 'download', filename );
    $link.get(0).click();

    // dispose blob; otherwise garbage collection will not collect this!
    // delay for a little; otherwise IE will not process the download
    setTimeout( () => URL.revokeObjectURL( blobURL ), 2000 );

    // close dialog
    dialog.close();

    // set export button to non-processing
    dialog.setProcessing();

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // return wrapped version
  let dialog;
  return dialog = new DialogWrapper( $content, {

    'beforeOpen': function( params ){

      // save reference to params
      curParams = params;

      // by default select the first option
      $inputs.eq(0).prop( 'checked', true );

      // the export of a visualization is only enabled, when there is a visualization set
      const $vizRadioBtn = $inputs.filter( '[data-part="vis"]' );
      if( curParams.ds.getVizSettings() == null ) {
        $vizRadioBtn.prop( 'disabled', true );
      } else {
        $vizRadioBtn.prop( 'disabled', false );
      }

    },

    'buttons': [

      {
        text:  'Export',
        click: triggerDownload,
      },


      {
        text:     'Cancel',
        'class':  'secondary',
        click:    () => dialog.close()
      },

    ]

  });

});