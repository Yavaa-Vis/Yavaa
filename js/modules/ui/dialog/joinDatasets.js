"use strict";
/**
 * dialog to join two dataset
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'ui/basic/types/Dataset',
         'text!template/ui/dialog/joinDatasets.htm',
         'text!template/ui/dialog/joinDatasets/selectionItem.htm',
         'text!template/ui/common/column.htm',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Y,
          Dataset,
          templ,
          templSelectionItem,
          templColumn,
          DialogWrapper ){

  // dialog content
  const $content = $( templ );

  // links to elements
  const $els = {
      newDs:  $content.find( '#joinDatasets_newDs' ),
      baseDs: $content.find( '#joinDatasets_baseDs' ),
      augmDs: $content.find( '#joinDatasets_augmDs' ),
      step1:  $content.find( '#joinDatasets_step1' ),
      step2:  $content.find( '#joinDatasets_step2' ),

      baseCol: $content.find( '#joinDatasets_step2 .dataset[data-ds="base"]'),
      augmCol: $content.find( '#joinDatasets_step2 .dataset[data-ds="augm"]'),
      baseTitle: $content.find( '#joinDatasets_step2 .dataset[data-ds="base"] .title'),
      augmTitle: $content.find( '#joinDatasets_step2 .dataset[data-ds="augm"] .title'),

      suggest: $content.find( '#joinDatasets_step2 button[data-action="suggest"]' ),

      /* column mapping interface */
      ctrl_rem: $content.find('#ctrl_rem'),         // input to remove connections
      ctrl_add: $content.find('#ctrl_add'),         // input to add connections
      curArrow: $content.find('.arrow'),            // interactive arrow
      container: $content.find('svg'),              // SVG container
      fixedArrows: $content.find('#fixedArrows'),   // container for fixed connections
      emptyG: $content.find( 'g.empty' )
                      .removeAttr( 'class' ),       // circumvent some namespacing issues with jQuery
  };

  // save a link to the currently active paramters
  let curParams;

  // prepare some regexp
  const regexp = {
      alias:    /{data_alias}/gi,
      id:       /{data_id}/gi,
      colAlias: /{label}/gi,
      colOrder: /{order}/gi,
      colUri:   /{uri}/gi,
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Step 1 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  $els.newDs
      .on( 'change', function() {

        if( $(this).is( ':checked' ) ) {
          // new ds to be generated
          
          // enable all options
          // should be in a valid state as this should have been ensured before
          $els.baseDs.prop( 'disabled', false );

        } else {
          // old ds should be replaced 
          
          // freeze base ds
          $els.baseDs.prop( 'disabled', true );

          // baseDs is set to the active dataset
          $els.baseDs.val( curParams.ds.getDataID() );

          // adjust augmenting datasets accordingly
          if( curParams.ds.getDataID() == $els.augmDs.val() ) {
            const $newSel = $els.augmDs
                                .find( `option:not( [value="${curParams.ds.getDataID()}"] )` )
                                .eq(0);
            $els.augmDs.val( $newSel.attr( 'value' ) );
          }
          $els.baseDs.trigger( 'change' );
          $els.augmDs.trigger( 'change' );
        }

      });

  $els.baseDs.add( $els.augmDs )
      .on( 'change', function(){

        // disable the next button
        dialog.setDisabled( 1, true );

        // shortcut
        const $this = $(this);

        // get currently selected element
        const $selDs = $this.find( ':selected' );

        // if the selection is empty, we don't have enough datasets, so skip
        if( $selDs.length < 1 ) {
          return;
        }

        // link to the other select box
        const $other = $this.is( $els.baseDs ) ? $els.augmDs : $els.baseDs;

        // find the respective entry in the other select box and disable it
        const $options = $other.find( 'option' );
        $options.removeAttr( 'disabled' );
        for( let i=0; i<$options.length; i++ ) {
          if( $options.eq(i).data( 'ds' ).getDataID() == $selDs.data( 'ds' ).getDataID() ) {

            // disable that option
            $options.eq(i).attr( 'disabled', 'disabled' );

            // if it is currently selected
            if( $options.eq(i).is( ':selected' ) ) {

              $options.eq(i).removeAttr( 'selected' );
              if( i+1 >= $options.length ) {
                $options.eq(i-1).attr( 'selected', true );
              } else {
                $options.eq(i+1).attr( 'selected', true );
              }

            }
            break;
          }
        }

        // if we came this far, the button can be reenabled
        dialog.setDisabled( 1, false );

      });


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Step 2 XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // enable switch between add mode and delete mode
  $content.find( 'input[name="controls"]' )
          .on( 'change', function(){

            // change mode for connections
            const mode = $(this).data( 'mode' );
            $els.container
                .attr( 'class', mode )
                .data( 'mode', mode );

            // (de)activate suggestion helper
            if( mode == 'add' )  {
              $els.suggest.prop('disabled', false );
            } else {
              $els.suggest.prop('disabled', true );
            }

          });

  $els.suggest.on( 'click', async function(){

    // set processing
    $els.suggest.attr( 'data-processing', true );

    // get selected datasets
    const base = $els.baseDs.find( ':selected' ).data( 'ds' ),
          augm = $els.augmDs.find( ':selected' ).data( 'ds' );

    // retrieve the suggestion
    const res = await Y.CommBroker
                        .execCommand({
                          'action': 'suggestJoin',
                          'params': {
                            data_id1: base.getDataID(),
                            data_id2: augm.getDataID(),
                          }
                        });
    const conditions = res.params.join_cond;

    // remove all existing connections
    $els.fixedArrows.find( 'g' ).remove();

    // create mappings for base and augm column elements
    const $baseCols = [],
          $augmCols = [];
    $els.baseCol.find( '.column' )
                .each( (ind, el) => { const $el = $(el); $baseCols[ $el.data('col_id') ] = $el; } );
    $els.augmCol.find( '.column' )
                .each( (ind, el) => { const $el = $(el); $augmCols[ $el.data('col_id') ] = $el; } );

    // add the new connections
    for( const cond of conditions ) {
      addConn( $augmCols[ cond[1] ],
               false,
               $baseCols[ cond[0] ],
               $augmCols[ cond[1] ],
               true
             );
    }

    // remove processing
    $els.suggest.removeAttr( 'data-processing' );

  });

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  const dialogParam = {
      'beforeOpen': function( params ){

        // update active parameters
        curParams = params;

        /* XXXXXXXXXXXX Cleanup XXXXXXXXXXXX */

        // clear old connections
        $els.fixedArrows.html('');
        if( $els.curArrow.data( 'active' ) ) {
          $els.curArrow.data('start').removeClass('selected');
          $els.curArrow.data('active', false )
          $els.container.off('mousemove', showArrow);
          $els.curArrow.hide()
                       .data('active', false)
        }

        // reset step 1 controls
        $els.baseDs.prop( 'disabled', true );
        $els.newDs.prop( 'checked', false );

        // clear involved datasets
        $els.step2.removeData( 'datasets' );

        // show correct buttons
        $( '#joinDatasets_join' ).hide();
        $( '#joinDatasets_next' ).show();

        // make sure, we show first step
        $els.step2.hide();
        $els.step1.show();

        // reset connection mode for step two
        $els.ctrl_add.trigger( 'click' );

        /* XXXXXXXXXXXX Init XXXXXXXXXXXX */

        // the active dataset
        const activeDs = params.ds;

        // get a list of all currently open datasets
        const list = Y.UIBroker.listDatasets();

        // create list of selection options
        const $options = $( document.createDocumentFragment() );
        for( const ds of list ) {
          const el = $( templSelectionItem.replace( regexp.alias, ds.getAlias() ) )
                      .data( 'ds',    ds )
                      .attr( 'value', ds.getID() );
          $options.append( el );
        }

        // add selection options to both selections
        $els.baseDs.html( $options.clone( true ) );
        $els.augmDs.html( $options.clone( true ) );

        // select the current dataset as base dataset
        $els.baseDs.val( activeDs.getID() );

        // set possible options
        $els.baseDs.trigger( 'change' );
        $els.augmDs.trigger( 'change' );

        // do we have enough datasets for any action?
        const enoughDatasets = list.length > 1;

        // disable/enable "next" button, depending on number of available datasets
        dialog.setDisabled( 'Next', !enoughDatasets );

        // if not enough datasets, show error message
        if( !enoughDatasets ) {
          dialog.showError( 'toofewdatasets' );
        } else {
          dialog.hideError();
        }

        // disable/enable augmenting dataset, if appropriate
        $els.augmDs.prop( 'disabled', !enoughDatasets );

      },

      'buttons': [{
        'id': 'joinDatasets_join',
        'text': 'Join',
        'click': async function(){

          // get the join condition
          let joinCond = [];
          $els.fixedArrows.find( '.connection' )
                          .each( function( ind, el ){

                            // get connection
                            let conn = $(el).data( 'conn' );

                            // add to results
                            joinCond.push([
                              conn.base.data( 'col_id' ),
                              conn.augm.data( 'col_id' ),
                            ]);

                          });

          // get link to involved datasets
          const sources = $els.step2.data( 'datasets' );

          // build command
          const cmd = {
            'action': 'join',
            'params': {
               'data_id':       sources['base'].getDataID(),
               'augm_data_id':  sources['augm'].getDataID(),
               'join_cond':     joinCond,
            }
          };

          // issue command
          if( $els.newDs.is( ':checked' ) ) {
            // create a new dataset
            
            // issue command directly
            const res = await Y.CommBroker.execCommand( cmd );
            
            // create new dataset
            const ds = new Dataset( res.params.data_id, 'data', cmd );

            // add dataset
            Y.UIBroker.addDataset( ds );

            // show in content view
            Y.UIBroker.showView( ds, 'data' );

          } else {
            // replace the old dataset
            
            // pipe through dataset-specific execution
            await sources['base'].execCommand( cmd.action, cmd.params );

          }

          // close dialog
          dialog.close();

        }
      },{
        'id': 'joinDatasets_next',
        'text': 'Next',
        'click': async function(){

          // get selected datasets
          let base = $els.baseDs.find( ':selected' ).data( 'ds' ),
              augm = $els.augmDs.find( ':selected' ).data( 'ds' );

          // save link to datasets for next step
          $els.step2.data( 'datasets', { 'base': base, 'augm': augm } );

          // get both columns' metadata
          const [ baseMeta, augmMeta ] = await Promise.all( [ base.getColumnMeta(), augm.getColumnMeta() ] );

          // create column lists
          function colToEl( col ) {
            const html = templColumn.replace( regexp.colAlias, col.getLabel() )
                                    .replace( regexp.colOrder, col.getID() )
                                    .replace( regexp.colUri,   col.getConcept() );
            return $( html )
                    .data( 'col_id', col.getID() )
                    .addClass( col.isDimension() ? 'dimension' : 'measurement' )
                    .on( 'click', columnClickHandler )
          }
          const baseCols = baseMeta.map( colToEl ),
                augmCols = augmMeta.map( colToEl );

          // clear interface
          $els.baseCol.find( '.column' ).remove();
          $els.augmCol.find( '.column' ).remove();

          // add to interface
          $els.baseCol.append( baseCols );
          $els.augmCol.append( augmCols );

          // show the titles
          $els.baseTitle.text( base.getAlias() );
          $els.augmTitle.text( augm.getAlias() );

          // hide this button and enable final join button
          $( '#joinDatasets_join' ).show();
          $( '#joinDatasets_next' ).hide();

          // change contents
          $els.step2.show();
          $els.step1.hide();

          // get sizes of interface
          const minHeight = Math.max( $els.baseCol.height(), $els.augmCol.height() );

          // adjust container size
          $els.container.css( 'min-height', minHeight );

        }
      },{
        'text': 'Cancel',
        'class': 'secondary',
        'click': () => dialog.close()
      }],
      'close': function(){

      }

    };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Column Mapping XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function columnClickHandler(){

    // just active, when mode is "add"
    if( $els.container.data( 'mode' ) != 'add' ) {
        return;
    }

    // shortcut
    const $this = $(this);

    // base or augm dataset?
    let isBase = $this.parent().data('ds') == 'base';

    // possible connection
    if ($els.curArrow.data('active')) {

        // starting point
        let $start = $els.curArrow.data('start');

        // do we have a working connection ( base <-> augm )?
        if ($els.curArrow.data('isBase') != isBase) {

            // get start and end of this connection
            let base, augm;
            if (isBase) {
                base = $this;
                augm = $start;
            } else {
                base = $start;
                augm = $this;
            }

            // check for valid connections
            if (validateConn(base, augm)) {
                addConn( $this, isBase, base, augm );
            }
        }

        // deactivate arrow
        $els.container.off('mousemove', showArrow);
        $els.curArrow.hide()
            .data('active', false)
        $start.removeClass('selected');
        return;
    }

    // get position
    let pos = $this.offset(),
        cPos = $els.container.offset();
    let top = pos.top - cPos.top;

    // activate arrow
    $els.curArrow.attr('x1', isBase ? '35%' : '65%' )
                  .attr('x2', pos.left + (isBase ? $this.outerWidth() : 0))
                  .attr('y1', top + $this.outerHeight() / 2)
                  .attr('y2', top + $this.outerHeight() / 2);
    $els.curArrow.data('isBase', isBase)
        .data('start', $this);

    $els.curArrow.show();
    $els.curArrow.data('active', true);
    $els.container.on('mousemove', showArrow);

    // mark node as selected
    $this.addClass('selected');
  }

  /**
   * handler for removing existing connections
   **/
  function removeConnection(){

      // just active, when mode is "del"
      if( $els.container.data('mode') != 'del' ) {
          return;
      }

      // remove connection
      $(this).remove();
  }

  /**
   * update the shown arrows direction
   **/
  function showArrow(ev) {
      // container offset
      let offset = $els.container.offset();
      $els.curArrow.attr('x2', ev.pageX - offset.left )
                   .attr('y2', ev.pageY - offset.top );
  }

  /**
   * validate a new connection
   **/
  function validateConn(start, end) {
      // TODO
      // return start.parent().children().index(start) == end.parent().children().index(end);
      return true;
  }


  /**
   * add a connection between both given column nodes
   */
  function addConn( $this, isBase, $base, $augm, sugg ) {

    // save connection data
    $els.curArrow.removeData( 'start' );

    // adjust arrow end
    let pos   = $this.offset(),
        cPos  = $els.container.offset(),
        top   = pos.top - cPos.top;
    $els.curArrow.attr('x2', isBase ? '35%' : '65%' )
                 .attr('y2', top + $this.outerHeight() / 2);

    // for suggested connections, we need to set more values
    if( sugg ) {
      const pos   = (!isBase ? $base : $augm).offset(),
            cPos  = $els.container.offset(),
            top   = pos.top - cPos.top;
      $els.curArrow.attr('x1', !isBase ? '35%' : '65%' )
                   .attr('y1', top + (!isBase ? $base : $augm).outerHeight() / 2);
      $els.curArrow.css( 'display', 'block' );
    }

    // copy to existing connections
    let $explArrow  = $els.emptyG.clone(),
        $underlay   = $els.curArrow.clone( true )
                                   .removeAttr( 'marker-start')
                                   .removeAttr( 'marker-end' );
    $underlay.attr( 'class', 'arrowUnderlay' );
    $explArrow
        .attr( 'class', 'connection' )
        .append( $underlay )
        .append( $els.curArrow.clone(true) )
        .on( 'click', removeConnection )
        .data( 'conn', {
            'base': $base,
            'augm': $augm
        });
    $els.fixedArrows.append( $explArrow );

    // for suggested deactivate the dynamic arrow again
    if( sugg ) {
      // deactivate arrow
      $els.container.off('mousemove', showArrow);
      $els.curArrow.hide()
          .data('active', false)
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // return wrapped version
  let dialog;
  return dialog = new DialogWrapper( $content, dialogParam );

});