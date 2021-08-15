"use strict";
/**
 * dialog for applying custom functions to a column
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'codemirror',
         'ui/grammar/formula.codemirror',
         'grammar/formula',
         'ui/dialog/applyFunction/getWordAt',
         'text!template/ui/dialog/applyFunction.htm',
         'ui/dialog/Wrapper',
         'basic/Constants' ],
function( $,
          jqueryUI,
          Y,
          Codemirror,
          Codemirror_mode,
          Parser,
          getWordAt,
          template,
          DialogWrapper,
          Constants
         ){

  // dialog content
  const $content = $( template );

  // templates
  const templ = {
      shortcut: $content.find( '#shortcut' ).contents(),
  };

  // current set of parameters and the current filter dialog handler
  let curParams;

  // elements
  const $el = {
      newCol:     $content.find( '#applyFunctionNewCol' ),
      newLabel:   $content.find( '#applyFunctionColLabel' ),
      remCols:    $content.find( '#applyFunctionRemCols' ),
      shortcuts:  $content.find( '#applyFunctionShortcuts' ),
      applyBtn: null,
      errorBox: $content.find( '.errMsg' ),
      error_wrongType_value: $content.find( '.errMsg [data-name="wrongType"] span' ),
  };

  // label input for new column is only shown, if it is a new column
  $el.newCol.on( 'input', function(){
    if( $el.newCol.prop( 'checked') ) {
      $el.newLabel.prop( 'disabled', false );
      $el.remCols.prop( 'disabled', false );
    } else {
      $el.newLabel.prop( 'disabled', true );
      $el.remCols.prop( 'disabled',  true );
    }
  });

  // click on columns inserts the respective variable in the editor
  $el.shortcuts.on( 'click', '.shortcutItem', function(){
    // get the respective shortcut/variable
    const variable = $(this).find( '.shortcut' ).text();
    // insert in the editor
    inputField.replaceSelection( ' ' + variable + ' ' );
    // set the focus again
    inputField.focus();
  });

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Code Input XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // init code-input
  const inputField = Codemirror.fromTextArea( $content.find( 'textarea' ).get(0),{
    lineNumbers: false,
    theme: 'yavaa',
    mode:  'yavaa',
    matchBrackets: true,
  });
  let changeTimer;
  inputField.on( 'change', () => {
    $el.errorBox.hide();
    clearTimeout( changeTimer );
    changeTimer = setTimeout( changeHandler, 500 );
  })

  // current error marker
  let errorMarker;

  /**
   * validate the code currently in the input field
   */
  async function changeHandler(){

    // clear old marker, if existent
    if( errorMarker ) {
      errorMarker.clear();
      errorMarker = null;
    }

    // validate the current input
    try{

      // get the current input value
      const input = inputField.getValue();

      // empty input is not valid
      if( input.trim() == '' ) {
        $el.applyBtn.prop( 'disabled', true );
        return;
      }

      // attempt to parse inputField's content
      const ast = Parser.parse( input )

      // get all value-fields
      let values = function walkAST( node ) {

        // leaf node
        if( !('children' in node) ) {
          return [ node.value ];
        }

        // inner node
        // https://stackoverflow.com/a/10865042/1169798
        const childResults = node.children.map( child => walkAST(child) );
        return [].concat.apply([], childResults );

      }( ast );

      // we're not concerned with constants
      values = values.filter( (v) => (v == 'value') || /^col\d+$/.test( v ) );

      // no 'value' in dataset-mode; only available in column mode
      if( !('colIndex' in curParams) && values.includes( 'value' ) ) {

        // show error messagenoValue
        dialog.showError( 'noValue' );

        // disable apply button
        $el.applyBtn.prop( 'disabled', true );
        return;

      }

      // map to column indices
      values = values.map( (v) => {
        if( v == 'value' ) {
          return curParams['col'].getID();
        } else {
          return +(v.replace('col', '' ) );
        }
      });

      // get all columns
      const cols = await curParams['ds'].getColumnMeta();

      // all columns need to be numeric
      for( let val of values ) {

        // columns has to exist
        if( !cols[ val ] ) {

          // show error message
          $el.errorBox.find( '[data-name="nonExist"] span').text( val );
          dialog.showError( 'nonExist' );

          // disable apply button
          $el.applyBtn.prop( 'disabled', true );
          return;

        }

        // column has to be numeric
        if( cols[ val ].getDatatype() != Constants.DATATYPE.NUMERIC ) {

          // show error message
          dialog.showError( 'wrongType' );

          // disable apply button
          $el.applyBtn.prop( 'disabled', true );
          return;

        }
      }

      // if we came this far, the formula is valid
      $el.applyBtn.prop( 'disabled', false );

      // remember values present
      $content.data( 'colsUsed', values );

    } catch (e) {

      // just react on syntax errors
      if( !(e instanceof Parser.SyntaxError) ) {
        throw e;
        return;
      }

      // disable apply button
      $el.applyBtn.prop( 'disabled', true );

      // find erroneous word
      const cause       = getWordAt( inputField.getValue(), e.location.start.offset ),
            causeLength = cause.length;

      // mark the error
      // https://stackoverflow.com/a/41405763/1169798
      let loc = e.location;
      let from = {line: loc.start.line-1, ch: loc.start.column-1 - (loc.start.offset === loc.end.offset)};
      let to   = {line: loc.end.line-1,   ch: loc.start.column-1+causeLength };
      errorMarker = inputField.markText( from, to, {className: 'cm-error', title: e.message} );

    }
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  const dialog = new DialogWrapper( $content, {
    'beforeOpen': async function( params ){

      // store current parameters
      curParams = params;

      // disable/enable checkbox
      if( 'colIndex' in params ) {
        $el.newCol.prop( 'checked', false )
                  .prop( 'disabled', false );
      } else {
        $el.newCol.prop( 'checked', true )
                  .prop( 'disabled', true );
      }

      // store link to apply button
      $el.applyBtn = dialog.getButton( 0 );

      // disable "apply" button for now
      $el.applyBtn.prop( 'disabled', true );

      // insert helper shortcuts
      const shortcuts = [],
            colMeta   = await params.ds.getColumnMeta();
      for( const col of colMeta ) {

        // clone an element
        const $el = templ.shortcut.clone( true );

        // insert data
        $el.find( '.shortcut' ).text( `col${col.getID()}` );
        $el.find( '.colContainer' ).html( await col.getTemplate() );

        // add
        shortcuts.push( $el );

      }
      if( 'colIndex' in params ) {
        // clone an element
        const $el = templ.shortcut.clone( true );

        // insert data
        $el.find( '.shortcut' ).text( 'value' );
        $el.find( '.colContainer' ).html( await colMeta[ params.colIndex ].getTemplate() );

        // add
        shortcuts.push( $el );
      }
      $content.find( '.infoBox' )
              .html( '' )
              .append( shortcuts );

      // reset settings
      $el.newCol.trigger( 'input' );        // trigger visibility
      $el.newLabel.val( '' );               // reset label value
      $el.remCols.prop( 'checked', false ); // reset remove source columns
      $content.data( 'colsUsed', [] );      // columns used in formula
      $content.find('#applyFunctionShortcutToggle').prop( 'checked', false );       // hide the shortcuts

    },

    'afterOpen': function() {

      // clear input field
      // (has to be at this point as CodeMirror does not clear in 'beforeOpen' event)
      inputField.setValue('');
      inputField.clearHistory();

      // set focus on input field
      inputField.focus();

    },

    'buttons': [{
      'text': 'Apply',
      'click': async function(){

        // get the function to apply
        const funktion = inputField.getValue();

        // if there is no function, we have nothing to do
        if( funktion == '') {
          dialog.close();
          return;
        }

        // set processing button
        dialog.setProcessing( 'Apply' );

        // new column?
        const newCol    = !!$el.newCol.prop('checked'),
              newLabel  = $el.newLabel.val();

        // get the affected column
        const colIndex = newCol ? -1 : curParams['col'].getID();

        // trigger command
        await curParams['ds']
                .execCommand( 'compute', {
                  'col_id':   colIndex,
                  'new_col':  newCol,
                  'label':    newCol ? newLabel : undefined,
                  'op_type':  'UDF',
                  'op':       funktion
                });

        // maybe remove source columns
        if( newCol && $el.remCols.prop( 'checked' ) ) {

          // get columns used
          const cols = $content.data( 'colsUsed' );

          if( cols.length > 0 ) {
            await curParams['ds']
                    .execCommand( 'dropColumns', {
                      'columns': cols,
                    });
          }

        }

        // reenable buttons
        dialog.setProcessing();

        // close dialog
        dialog.close();

      }
    },{
      'text': 'Cancel',
      'class': 'secondary',
      'click': function(){
        // close dialog
        dialog.close();
      }
    }]

  });

  // return wrapped version
  return dialog;

});