"use strict";
/*
 * provide code for first tab: specify query
 * - autocomplete for inputs and collect results
 *
 *
 * returns a function to serialize inputs
 *
 */
define( [ 'basic/Constants',
          'jquery',
          'jquery-ui',
          'jquery.datetimepicker',
          'moment',
          'ui/basic/Yavaa.global',
          'text!template/ui/common/column.htm',
          'text!template/ui/common/value.htm',
          ],
function( Constants,
          $,
          jqueryUI,
          jquery_datetimepicker,
          Moment,
          Y,
          templColumn,
          templValue
){

  // local config object; will be set after init
  let localCfg,       // config object
      $dialog;        // dialog container

  // template items and elements
  // will be set through init handler
  const $templ = {},
        $els = {};

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX AutoComplete XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // autocomplete parameters
  const acParam = {

        // number of characters, before autocomplete is activated
        minLength: 2,

        // add some class to identify this autocomplete
        classes: {
          "ui-autocomplete": "yavaa-construct-ac"
        },

        // get terms for autocomplete
        source: async function( req, res ){

          // shortcut
          const $el = $( this.element );

          // we need a column or a value?
          let type, codelist;
          if( $el.data( 'type' ) == 'value' ) {
            type = 'value';
            codelist = $el.data( 'codelist' );
          } else {
            type = 'column';
          }

          // retrieve terms
          const data = await Y.CommBroker.execCommand({
                                          'action': 'typeAhead',
                                          'params': {
                                            'needle':   $el.val(),
                                            'type':     type,
                                            'codelist': codelist
                                          }
                                        });

           // transform result
           const terms  = data['params']['terms'],
                 keys   = Object.keys( terms ),
                 acRes  = [];
           keys
             .forEach( (key) => {

               // add URI
               terms[ key ].id = key;

               // add to result
               acRes.push( terms[ key ] );

             });

           // return values
           res( acRes );

        },

        // react on selected item
        select: function (ev, ui) {

          // insert new item
          setCol( $(this), ui.item );

          // prevent default event
          ev.preventDefault();

        },
  };

  /**
   * insert value from input field as a new line directly above the input field
   */
  function setCol( $anchor, item ) {

    // get shown label and id
    let label, id, type;
    if (typeof item == 'object') {
        label = item.label + ' ';
        id    = item.id;
        type  = item.type;
    } else {
        label = '' + item;
        id    = null;
        type  = null;
    }

    // some shortcuts
    const $row    = $anchor.closest( '.colitem' ),
          $label  = $anchor.closest( 'label' );

    let $newElement;
    if( $anchor.data( 'type' ) != 'value' ) {

      // for top level inputs add another 2nd level input

      // create item for column title
      const tag = templColumn.replace( /{uri}/gi,   id )
                             .replace( /{order}/gi, '' )
                             .replace( /{label}/gi, label ),
            $tag = $( tag );
      $tag.data( 'type', type );

      // replace input with tag
      $label.replaceWith( $tag );

      // create value input
      let $input;
      switch( item.type ) {

        case Constants.DATATYPE.NUMERIC:   // create input field and append to line
                          $input = $templ.rangeSel.clone( true );
                          // replace in val container
                          $row.find( '.val' )
                              .addClass( 'range' )
                              .html( $input );
                          // focus input
                          $input.find( 'input[data-range="from"]' ).focus();
                          break;

        case Constants.DATATYPE.TIME:      // create input field and append to line
                          $input = $templ.rangeSel.clone( true );
                          $input.find( 'input')
                                .attr( 'data-datepicker', '' )
                                .datetimepicker({
                                  format:       localCfg.dateFormat,
                                  step:         15,
                                  defaultTime:  '00:00',
                                  timepicker:   false,    // for now; we don't have more precise data anyways
                                  closeOnDateSelect: true,
                                  theme:        'dark',
                                  onGenerate:   function(time, $input) {
                                    // http://stackoverflow.com/a/12352207/1169798
                                    const $this = $(this);
//                                    $input
//                                      .parent( 'label.input' )
//                                      .append( $this );
//                                    $this.css({
//                                      'top': '3.1rem',
//                                      'left': '0'
//                                    })
                                  },
                                  onClose( _, $input ){
                                    // if only a part of an ISO date is given, complete it
                                    const input = $input.val();

                                    // parse given string
                                    let inputFormat;
                                    switch( true ) {
                                      case /^\d{4}$/.test( input ):
                                        inputFormat = 'YYYY';    break;
                                      case /^\d{4}.\d{2}]$/.test( input ):
                                        inputFormat = 'YYYY-MM'; break;
                                    }
                                    if( !inputFormat ) {
                                      return;
                                    }

                                    // parse the string
                                    const date = Moment( input, inputFormat );

                                    // adjust for min/max
                                    if( $input.data('range') == 'from' ) {

                                      // the min value is set to the earliest possible date
                                      switch( inputFormat ) {
                                        case 'YYYY':    date.startOf( 'year' );   break;
                                        case 'YYYY-MM': date.startOf( 'month' );  break;
                                      }

                                    } else {

                                      // the max value is set to the latest possible date
                                      switch( inputFormat ) {
                                        case 'YYYY':    date.endOf( 'year' );   break;
                                        case 'YYYY-MM': date.endOf( 'month' );  break;
                                      }

                                    }

                                    // set the input value to ISO compliant format
                                    $input.val( date.format( 'YYYY-MM-DD' ) );

                                  },
                                  format:'Y-m-d'
                                });
                          // replace in val container
                          $row.find( '.val' )
                              .addClass( 'range' )
                              .html( $input );
                          // focus input
                          $input.find( 'input[data-range="from"]' ).focus();
                          break;

        case Constants.DATATYPE.SEMANTIC:  // create input field and append to line
                          // add entity input field
                          $input = $templ.entitySel.clone( true );
                          $row.find( '.val' )
                              .append( $input );
                          makeAC( $input.find( 'input' ).data( 'codelist', id ) );
                          // restrict to this column's values
                          $input.data( 'codelist', id );
                          // focus input
                          $input.find( 'input' ).focus();
                          break;

        default: throw Error( 'Unknown column type: "' + item.type + '"' );

      }

    } else {

      // second level (enumeration) values

      // create tag element
      const tag = templValue.replace( /{uri}/gi,   id )
                            .replace( /{order}/gi, '' )
                            .replace( /{label}/gi, label ),
            $tag = $( tag );
      $tag.data( 'type', type );

      // insert before input container
      $tag.insertBefore( $label );

      // set top level concept, if missing
      let $columnInput = $row.find( '.col label input' );
      if( $columnInput.length > 0 ) {

        // set column type
        const $newCol = setCol( $columnInput, {
                          label: item.codelistLabel,
                          id: item.codelist,
                          type: Constants.DATATYPE.SEMANTIC
                        });

      }

      // clean input value
      $anchor.val( '' );

    }

    return $newElement;
  }


  /**
   * convert given fields to use the autocomplete features
   */
  function makeAC( $el ) {

     // set parent element of autocomplete container to parent of dialog to prevent z-index issues
     acParam.appendTo = $dialog.parent();

     // activate autocomplete
     $el.autocomplete( acParam );

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Remove entry XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * add the event listener to remove columns/values from the list
   *
   * @param   {jQuery}    $content    the tab container element
   */
  function addRemoveListener( $content ) {

    $content.on( 'click', 'span.tag', function(){

      // shortcut
      let $this = $(this);

      // concept or value?
      let isConcept = $this.hasClass( 'column' );

      if( isConcept ) {

        // for concepts we remove the whole row
        $this.closest( '.colitem' ).remove();

      } else {

        // for values just the tag is removed
        $this.remove();

      }

    });

  }


  /**
   * remove a whole column row (column entity + values)
   *
   * @param   {jQuery}    $content    the tab container element
   */
  function addRemoveRowListener( $content ) {

    $content.on( 'click', '.helper.remCol', function(){

      $(this).closest( '.colitem' ).remove();

    });

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Add entry XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * append a new column entry section to the column input list
   * @returns {jQuery}    the created container row
   */
  function addCol() {

    // clone item
    const $entry = $templ.newCol.clone( true );

    // append
    $els.collist.append( $entry );

    // add autocomplete
    makeAC( $entry.find( 'input' ) );

    return $entry;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Serialize Inputs XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return a structured list of all input columns and values
   */
  function serializeInputs( $content ){

    // grab top level elements
    const $topLevel = $content.find( '.collist > .colitem' );

    // extract relevant values
    const res = $topLevel.map( function( ind ) {

      // shortcuts
      const $this    = $(this),
            $concept = $this.find( '.col span.column' ).eq(0);

      // get values for this entry
      let children, range;
      const type      = $concept.data( 'type' ),
            $valCont  = $this.find( '.val' );
      switch( type ) {

        case Constants.DATATYPE.NUMERIC:
                  range = {};

                  $valCont.find( 'input' ).each( function(){

                    // shortcut
                    const $this = $(this),
                          val = $this.val().trim();

                    if( val ) {
                      range[ $this.data( 'range' ) ] = parseFloat( val );
                    }

                  })
                  break;

        case Constants.DATATYPE.TIME:
                  range = {};

                  $valCont.find( 'input' ).each( function(){

                    // shortcut
                    const $this = $(this),
                          val = $this.val().trim();

                    if( val ) {
                      let date = Moment( val, localCfg.dateFormatMoment );
                      range[ $this.data( 'range' ) ] = date.valueOf();
                    }

                  })
                  break;

        case Constants.DATATYPE.SEMANTIC:
        default:
                  // get children and parse data from them
                  children = $valCont.find( 'span.value' ).map( function(){

                    // shortcut
                    const $this = $(this);

                    // get data
                    const concept = $this.data( 'uri' ),
                          label   = $this.text().trim();

                    // return the concept
                    return concept || null;

                  }).get();
      }

      // get data
      const concept = $concept.data( 'uri' );

      // return only, if we have some inputs
      if( concept || (children.length > 0) ) {
        return {
          'datatype': type,
          'concept':  concept             || null,
          'colEnums': children            || null,
          'minValue': range ? range.from  :  null,
          'maxValue': range ? range.to    :  null
        }
      }

    }).get();

    return res;
  }

  /**
   * return the text included in this element; disregarding the text of child elements
   * http://stackoverflow.com/a/14755309/1169798
   */
  function getText( $el ) {

    const text = $el.contents()
                    .filter(function(){
                      return this.nodeType === 3;
                    });
    if( text.length > 0 ) {
      return text .get( 0 )
                  .nodeValue
                  .trim();
    } else {
      return '';
    }

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Return Value XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * initialize this query tab
   *
   * @param   {jQuery}    $dialog       reference to the dialog element
   * @param   {jQuery}    $content      the tab container element
   * @returns {Function}                function to serialize all inputs
   */
  return function tabQuery( $dialogRef, $content, cfg ) {

    // copy references to config objects
    localCfg = cfg;
    $dialog = $dialogRef

    // maintain some element references
    $templ.newCol     = $content.find( '#constructNewCol' ).contents();
    $templ.entitySel  = $content.find( '#constructEntitySel' ).contents();
    $templ.rangeSel   = $content.find( '#constructRangeSel' ).contents();
    $els.collist      = $content.find( '.collist' );

    // add first input row
    addCol();

    // init buttons
    $content.find( '.helperbtns .addCol' )
            .on( 'click', addCol );

    // initialize removal of columns/values
    addRemoveListener( $content );

    // initialize removal of whole column entries (rows)
    addRemoveRowListener( $content );

    // return global function pointers
    return {
      serializeInputs: function serialize(){
        return serializeInputs( $content );
      },
      reset: function(){

        // clear input list
        $els.collist.html( '' );

        // add one column
        addCol();

      },
      // TODO remove after removing "test" button from dialog
      setCols: function( def ) {

        // clear input list
        $els.collist.html( '' );

        for( let colDef of def ) {

          // add new row
          const $row = addCol();

          // set column title
          setCol( $row.find( '.col input'), colDef.col );

          // add values (if semantic)
          switch ( colDef.col.type ) {
            case Constants.DATATYPE.SEMANTIC: {
                                                const $input = $row.find( '.val input' );
                                                for( let valDef of colDef.vals ) {
                                                  setCol( $input, valDef );
                                                }
                                                break;
                                              }
            case Constants.DATATYPE.TIME:
            case Constants.DATATYPE.NUMERIC: {
                                                $row.find( '.val input[data-range="from"]' )
                                                  .val( colDef.vals.min );
                                                $row.find( '.val input[data-range="to"]' )
                                                  .val( colDef.vals.max );
                                                break;
                                              }
          }

        }
      }
    };
  }

});