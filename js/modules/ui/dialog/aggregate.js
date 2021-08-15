"use strict";
/**
 * dialog for performing GROUP BY on datasets
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/aggregate.htm',
         'text!template/ui/dialog/aggregate/columnwrapper.htm',
         'ui/basic/Overlay',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Y,
          templ,
          templCol,
          Overlay,
          DialogWrapper
         ){

  // dialog content
  const $content = $( templ );

  // init drag and drop
  init( $content );

  // current set of parameters and the current filter dialog handler
  let curParams,
      curHandler;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  const dialog = new DialogWrapper( $content, {
    'beforeOpen': async function( params ){

      // store current parameters
      curParams = params;

      // clean off old values
      $content.find( '.dropzone' ).html( '' );

      // set loading icon
      const overlay = new Overlay( $content );

      // get list of columns
      const cols = await params.ds.getColumnMeta();

      // create entries for all columns
      const $dims = [], $meas = [];
      await Promise.all( cols.map( async (col) => {

        // create column entry
        const $col = await col.getTemplate();

        // add to wrapper
        const $colWrapper = $( templCol );
        $colWrapper.attr( 'data-type',  col.getDatatype() );
        $colWrapper.attr( 'data-order', col.getID() );
        $colWrapper.prepend( $col );

        // add
        if( col.isDimension() ) {
          $dims.push( $colWrapper );
        } else {
          $meas.push( $colWrapper );
        }

      }));

      // add
      $content.find( '.group' )
              .append( $dims );
      $content.find( '.aggr' )
              .append( $meas );

      // init drag and drop
      initColumns( $content );

      // enable apply button
      dialog.setDisabled( 'Apply', false );

      // remove the overlay
      overlay.remove()

    },

    'buttons': [{
        'text': 'Apply',
        'click': async function(){

          // set processing button
          dialog.setProcessing( 'Apply' );

          // collect columns to be grouped by
          const groupCols = $content.find( '.group .columnwrapper' )
                                  .map( function( ind, el ){
                                    return parseInt( $( el ).data( 'order' ), 10 );
                                  })
                                  .get();

          // for the other columns, get the respective aggregate functions
          const aggCols = [];
          $content.find( '.aggr .columnwrapper' )
                  .each( function( ind, el ){

                    // shortcut
                    const $el = $(el);

                    // add to list
                    aggCols[ parseInt( $el.data( 'order' ), 10 ) ] = $el.find( 'select' ).val();

                  });

          // issue command
          await curParams['ds'].execCommand( 'aggregate', {
                                  'data_id': curParams.ds.getDataID(),
                                  'cols':    groupCols,
                                });

          // reenable buttons
          dialog.setProcessing();

          // close dialog
          dialog.close();

        }
      },{
        'text': 'Cancel',
        'class': 'secondary',
        'click': () => dialog.close()
      }
    ]

  });

  // return wrapped version
  return dialog;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Drag & Drop XXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * initialize dropzones
   */
  function init( $base ) {

    // get all dropzones
    var $dropzones = $base.find('.dropzone');

    // highlight current dropzone
    $dropzones.on( 'dragover dragenter', function (evt) {
        $(this).addClass('valid');
        evt.preventDefault();
    });

    // remove highlighting
    $dropzones.on( 'dragleave', function (evt) {
        $(this).removeClass( 'valid' );
    });

  }


  /**
   * initialize columns
   */
  function initColumns( $base ) {

    // get all involved elements
    let $draggedEl  = null;
    const $draggables = $base.find( '[draggable=true]' ),
          $dropzones  = $base.find( '.dropzone' );

    // make the element draggable
    $draggables.on( 'dragstart', function (evt) {
        evt.originalEvent.dataTransfer.setData('text', 'dragging');
        $draggedEl = $(this);
    });

    $draggables.on( 'drag', function (evt) {});
    $draggables.on( 'dragend', function (evt) {});

    // remove old handler
    $dropzones.off( 'drop' );

    // when dropped
    $dropzones.on( 'drop', function (evt) {

        evt.preventDefault();

        // elements
        const $this = $(this);

        // disable marker for this dropzone
        $(this).removeClass( 'valid' );

        // insert element
        $this.append( $draggedEl );

        // free dragged element
        $draggedEl = null;

        // sort entries within the dropzone
        $this.find( '.columnwrapper' )
            .detach()
            .sort( function( a, b ) {
                return $(a).data( 'order' ) - $(b).data( 'order' );
            })
            .appendTo( $this );

        // check, whether there is any column to be aggregated and one to be grouped by
        const groupBy = $content.find( '.group .columnwrapper').length,
              aggr    = $content.find( '.aggr  .columnwrapper').length;
        if( (groupBy < 1) || (aggr < 1) ) {
          dialog.setDisabled( 'Apply', true );
        } else {
          dialog.setDisabled( 'Apply', false );
        }

    });

  }

});