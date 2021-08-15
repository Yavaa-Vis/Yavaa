"use strict";
/**
 * dialog for visualizing datasets
 */
define( ['basic/Constants',
         'jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/visualize.htm',
         'ui/basic/Overlay',
         'ui/dialog/Wrapper',
         'util/requirePromise'
         ],
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

  // link to elements
  const $els = {
      secList:    $content.find( '.list'),
      secDetails: $content.find( '.details'),
      startCollection: $content.find( '.collection' )
  };

  // template items
  const $templ = {
      item:         $content.find( '#visualizeItem' ).contents(),
      item2:        $content.find( '#visualizeItem2' ).contents(),
      binding:      $content.find( '#visualizeBinding' ).contents(),
      omittedMeas:  $content.find( '#visualizeOmittedMeas' ).contents(),
      omittedDim:   $content.find( '#visualizeOmittedDim' ).contents(),
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': async function( param ){

      // show/enable correct buttons
      $( '#visualize_next' ).prop( "disabled", true ).show();
      $( '#visualize_do' ).hide();

      // clean output
      $els.secList.html('');

      // show/enable first tab
      $( '#visualize [data-step]' ).each( function( ind, el ){
        const $el = $( el );
        if( $el.data( 'step' ) == 1 ) {
          $el.show();
        } else {
          $el.hide();
        }
      });

      // save link to dataset
      $content.data( 'ds', param['ds'] );

      // trigger request for suggestions
      const msg = await Y.CommBroker
                          .execCommand({
                            'action': 'suggestViz',
                            'params': {
                              'data_id': param['ds'].getDataID()
                            }
                          });

      // get suggestion list
      const suggs = msg['params']['sugg'];

      // nothing found, display message and end here
      if( suggs.length < 1 ) {
        dialog.showError( 'noHit' );
        return;
      } else {
        dialog.hideError();
      }

      // get columns
      const cols = await param['ds'].getColumnMeta()

      // collect previews
      const out = [];
      let   $entry;
      for( const sugg of suggs ) {

        // nested viz?
        if( typeof sugg.preview == 'string' ) {

          // clone item
          $entry = $templ.item.clone( true );

          // preview image
          $entry.find( 'img' )
                .attr( 'src', `/viz/${sugg.preview}` );

          $entry.attr( 'title', sugg.id );

        } else {

          // clone item
          $entry = $templ.item2.clone( true );

          // preview images
          $entry.find( 'img:nth-of-type(1)' )
                .attr( 'src', `/viz/${sugg.preview[0]}` );
          $entry.find( 'img:nth-of-type(2)' )
                .attr( 'src', `/viz/${sugg.preview[1]}` );

          $entry.attr( 'title', `Nested: ${sugg.id.layout} + ${sugg.id.nested}` );

        }

        // common values
        $entry.data( 'binding',     sugg );
        $entry.data( 'omittedCols', msg['params']['omitted'] );

        // add unmapped columns indicator(s)
        // currently should only be measurements
        const usedCols    = Object.values( sugg.binding.binding ).flat(),
              unusedCols  = cols.filter( (c) => !usedCols.includes( c.getID() ) );
        $entry.find( '.omittedcols' )
              .append( 
                unusedCols.map( (c) => {
                  if( c.isDimension() ) {
                    return $templ.omittedDim.clone( true );
                  } else {
                    return $templ.omittedMeas.clone( true );
                  }
                } )
              );

        // collect
        out.push( $entry );

      }

      // insert to output
      $els.secList.append( out );

      // assign change handler
      $els.secList.find( '.item' ).on( 'change', function(){

        // activate next button
        $( '#visualize_next' ).prop( "disabled", false );

      });

      // show info for large datasets, if appropriate
      const meta = await param['ds'].getMeta();
      if( meta.entries > 10000 ) {
        dialog.showInfo( 'manyValues' );
      } else {
        dialog.hideInfo();
      }

    },

    'buttons': [

       {
         'id':  'visualize_next',
         'text': 'Next',
         'click': async function(){

           // pull the visualisation description
           const $selectedItem = $( '#visualize [name="selectedViz"]:checked' ).closest( '.item' ),
                 bindingData   = $selectedItem.data( 'binding' ),
                 omittedCols   = $selectedItem.data( 'omittedCols' );

           // load dependencies
           const deps = [];
           if( $selectedItem.hasClass( 'nested' ) ) {
             deps.push( `viz/${bindingData['id'].layout}.desc`);
             deps.push( `viz/${bindingData['id'].nested}.desc`);
           } else {
             deps.push( `viz/${bindingData['id']}.desc`);
           }
           const desc = await requireP( deps );
           $selectedItem.data( 'desc', desc );

           // setup step2 with data

           // clear old data
           $( '#visualize .column, #visualize .binding' ).remove();

           // insert current columns
           const ds   = $content.data( 'ds' ),
                 cols = await ds.getColumnMeta()

           // add all columns to output
           const $cols = await Promise.all( cols.map( c => c.getTemplate() ) );
           $cols.forEach( c => c.attr( 'draggable', 'true' ) );
           $( '#visualize .collection' ).append( $cols );

           // mark columns that were omitted from the suggestion
           // should be single-valued dimensions
           $cols.filter( (el) => omittedCols.includes( $(el).data( 'col_id' ) ) )
                .forEach( (el) => el.addClass( 'singlevalued' ) );

           // collect bindings from the description(s)
           const bindings = [];
           if( $selectedItem.hasClass( 'nested' ) ) {
             bindings.push( ... desc[0][ bindingData.bindingId.layout ].columnBinding
                                   .filter( (col) => col.datatype != Constants.VIZDATATYPE.VISUALIZATION )
                          );
             bindings.push( ... desc[1][ bindingData.bindingId.nested ].columnBinding );
           } else {
             bindings.push( ... desc[0][ bindingData.bindingId ].columnBinding );
           }
           desc[ bindingData.bindingId ];

           // prepare templates
           const $out = [];
           let $entry;
           for( let bind of bindings ) {

             // clone item
             $entry = $templ.binding.clone( true );

             // tag mandatory bindings
             if( !('optional' in bind) || !bind.optional ) {
               $entry.addClass( 'mandatory' );
             }

             // prepare element
             $entry.find( 'td:nth-of-type(1)' )
                   .attr( 'title', bind.id )
                   .text( bind.desc )

             // add data
             const multiple = !!bind.isarray;
             $entry.data( 'datatype',    bind.datatype )
                   .data( 'id',          bind.id )
                   .data( 'maxcount',    multiple ? -1 : 1 )
                   .data( 'bindingDef',  bind )
                   .data( 'suggBinding', bindingData.binding.binding[ bind.id ] );

             // add to result
             $out.push( $entry );

           }

           // add to DOM
           $( '#visualize .bindings' ).html('').append( $out );

           // apply all handlers etc
           init( $content );

           // hide this button and show next one
           $( '#visualize_next' ).hide();
           $( '#visualize_do' ).prop( 'disabled', true ).show();

           // switch tabs
           $( '#visualize [data-step]' ).each( function( ind, el ){
             const $el = $( el );
             if( $el.data( 'step' ) == 2 ) {
               $el.show();
             } else {
               $el.hide();
             }
           });

         }
       },
       {
         'id': 'visualize_do',
         'text': 'Visualize',
         'click': async function(){

           // set processing
           dialog.setProcessing( 'Visualize' );

           // extract current binding
           const $bindings = $content.find( '.binding' ),
                 binding = {};
           for( let i=0; i<$bindings.length; i++ ) {

             // grab all assigned columns
             const cols = $bindings.eq(i)
                                   .find( '.column' )
                                   .map( function( ind, el ){
                                     return $( el ).data( 'col' );
                                   })
                                   .get()
                                   .map( c => c.getID() );

             // add to result
             binding[ $bindings.eq(i).data('id') ] = cols.length > 1 ? cols : cols[0];

           }

           // get the selected binding data
           const $selectedItem = $( '#visualize [name="selectedViz"]:checked' ).closest( '.item' ),
                 bindingData = $selectedItem.data( 'binding' );

           // adjust for nested visualizations
           let type = bindingData.id;
           if( $selectedItem.hasClass( 'nested' ) ) {
             const desc = $selectedItem.data( 'desc' );
             type = bindingData.id.layout;
             desc[0][ bindingData.bindingId.layout ]
               .columnBinding
               .forEach( (bind) => {
                 if( bind.datatype == Constants.VIZDATATYPE.VISUALIZATION ) {
                   binding[ bind.id ] = bindingData.id.nested;
                 }
               });
           }

           // set current viz settings
           const ds = $content.data( 'ds' );
           ds.setVizSettings({
             'type':    type,
             'options': binding
           });

           // switch to viz tab
           await Y.UIBroker.showView( ds, 'viz' );

           // close dialog
           dialog.close();

           // remove processing
           dialog.setProcessing();

         }
       },
       {
         'id': 'visualize_cancel',
         'text': 'Cancel',
         'class': 'secondary',
         'click': function(){

           // clear fields
           $els.secList.html( '' );

           // close dialog
           dialog.close();

         }
        }
    ]

  });



  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Init Binding UI XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function init( $base ){

    // enable "use computed matching" and "reset" buttons
    $base.find( '.useSuggestion' ).on( 'click', () => useSuggestion( $base ) );
    $base.find( '.resetBinding'  ).on( 'click', () => resetBinding( $base ) );

    // enable drag&drop
    let $draggedEl = null;
    const draggables = $base.find('[draggable=true]'),
          dropzones =  $base.find('.dropzone');

    draggables.on('dragstart', function (evt) {
      evt.originalEvent.dataTransfer.setData('text', 'dragging');
      $draggedEl = $(this);
    });

    dropzones.on('dragover', function (evt) {
      const $this = $(this);
      if ($this.hasClass('collection') || isValidTarget($this.closest('.binding'), $draggedEl)) {
        $this.addClass('valid');
      } else {
        $this.addClass('invalid');
      }
      evt.preventDefault();
    });

    dropzones.on('dragenter', function (evt) {
      const $this = $(this);
      if ($this.hasClass('collection') || isValidTarget($this.closest('.binding'), $draggedEl)) {
        $this.addClass('valid');
      } else {
        $this.addClass('invalid');
      }
      evt.preventDefault();
    });

    dropzones.on('dragleave', function (evt) {
      $(this).removeClass('valid invalid');
    });

    dropzones.on('drop', function (evt) {
      evt.preventDefault();

      // elements
      const $this = $(this);

      // disable marker for this dropzone
      $(this).removeClass('valid invalid');

      // different behavior for binding drop and available columns drop
      if ($this.hasClass( 'collection' )) {

        // insert element
        $this.append( $draggedEl );

      } else {

        // get the binding
        const $binding = $this.closest('.binding');

        // check, if it is a valid target
        if (isValidTarget($binding, $draggedEl)) {

          // insert element
          $this.append( $draggedEl );

          // validate binding
          validateBinding();

        }

      }

      // sort elements by their column id
      $this.find( '.column' ).sort( (a,b) => $(a).data( 'col_id' ) - $(b).data( 'col_id' ) )
           .appendTo( $this );

      // validate binding
      validateBinding();

      // free dragged element
      $draggedEl = null;
    });
  }

  /**
   * determine, if a binding is a valid target for a specific column
   */
  function isValidTarget($binding, $col) {

    // if we got no binding, this is no valid target
    if( $binding.length < 1 ) {
      return false;
    }

    // get the referenced definition objects
    const col     = $col.data( 'col' ),
          binding = $binding.data( 'bindingDef' );

    // translate between dataset types and viz types
    let colType = Constants.VIZDATATYPE.CATEGORICAL;
    switch( col.getDatatype() ) {
      case Constants.DATATYPE.NUMERIC: colType = Constants.VIZDATATYPE.QUANTITATIVE; break;
      case Constants.DATATYPE.TIME:    colType = Constants.VIZDATATYPE.TIME;         break;
    }

    // compare the datatypes
    if( (binding.datatype & colType) === 0 ) {
      return false;
    }

    // compare the roles
    if( col.getRole() && (binding.role != col.getRole()) ) {
      return false;
    }

    // check maximum number of columns in this binding
    const maxCount = $binding.data('maxcount');
    if ((maxCount > 0) && (maxCount <= $binding.find('.column').length)) {
      return false;
    }

    // if we come this far, it is ok
    return true;

  }

  /**
   * use the computed matching for the binding
   */
  function useSuggestion( $base ){

    // reset the bindings
    resetBinding( $base );

    // get a list of all columns by their id
    const $cols = $base.find( '.column' ),
          colMap = {};
    for( let i=0; i<$cols.length; i++ ) {
      const col = $cols.eq( i ).data( 'col' );
      colMap[ col.getID() ] = $cols.eq( i );
    }

    // walk through all bindings and in each collect the respective columns
    const $bindings = $base.find( '.binding' );
    for( let i=0; i<$bindings.length; i++ ) {

      // shortcut
      const $binding = $bindings.eq( i );

      // get the list of columns for this binding
      let colIds = $binding.data( 'suggBinding' );

      // if there is no suggestion, skip
      if( typeof colIds == 'undefined' ) {
        continue;
      }

      // move all the columns to the binding
      if( !(colIds instanceof Array) ) { colIds = [ colIds ]; }
      for( let j=0; j<colIds.length; j++ ) {
        $binding.find( '.dropzone' ).append( colMap[ colIds[j] ] );
      }

    }

    // enable visualize button
    validateBinding();

  }

  /**
   * reset the current selected bindings moving all columns back to the "available columns" field
   */
  function resetBinding( $base ){

    // move all column objects back to start
    $base.find( '.column' ).appendTo( $els.startCollection );

    // activate "openslot" fields
    $base.find( '.openslot' ).show();

    // disable visualize button
    validateBinding();

  }


  /**
   * validate, if the current binding satisfies all constraints
   * - all mandatory columns are bound
   */
  function validateBinding(){

    // get all mandatory bindings
    const $mandatory = $content.find( '.binding.mandatory' );
    
    // check, if they have at least one column bound
    // (multiple required columns for a single binding are not possible right now)
    let valid = true;
    for( const binding of $mandatory ) {
      valid = valid && ($(binding).find( '.column' ).length > 0);
    }

    // enable/disable do-button
    if( valid ) {
      $( '#visualize_do' ).prop( 'disabled', false );
    } else {
      $( '#visualize_do' ).prop( 'disabled', true );
    }

  }

});