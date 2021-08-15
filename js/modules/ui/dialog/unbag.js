"use strict";
/**
 * dialog for using aggregate functions on bagged columns
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'comp/aggregate/FunctionList',
         'text!template/ui/dialog/unbag.htm',
         'ui/basic/Overlay',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Y,
          functionList,
          templ,
          Overlay,
          DialogWrapper
         ){

  // dialog content
  const $content = $( templ );

  // insert aggregate options
  const $opts = functionList.map( (el) => {

    const $opt = $( '<option />' );
    $opt.text( el.name )
        .data( 'module', el );
    return $opt;

  });
  $content.find( '.options' ).html('').append( $opts );

  // add change handler
  $content.find( 'select' )
          .on( 'change', function(){

            // shortcut
            const $this = $(this);

            // get selected option
            const $opt = $this.find( ':selected' ),
                  desc = $opt.data( 'module' );

            // set infos
            $content.find( '.name' ).html( desc['name'] );
            $content.find( '.desc' ).html( desc['desc'] );

          })
          .trigger( 'change' );



  // current set of parameters and the current filter dialog handler
  var curParams;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': async function( params ){

      // store current parameters
      curParams = params;

      // insert column header
      $content.find( '.col' ).html( await params.col.getTemplate() );

      // get subdatatype of current column
      const subdatatype = params.col.getAttribute( 'subdatatype' );

      // check aggregation functions for compatibility
      $content.find( '.options option' )
              .each( function( ind, el ){

                // shortcut
                var $el = $(el),
                    desc = $el.data( 'module' );

                // check, if applicable for this type
                if( functionApplicable( subdatatype, desc ) ) {

                  $el.removeProp( 'disabled' );

                } else{

                  $el.prop( 'disabled', true );

                }

              });

      // change to first option in the list
      $content.find( '.options option' )
        .each( (ind, el) => {
          const $el = $(el);
          if( !$el.prop( 'disabled' ) ) {
            $el.prop( 'selected', true );
            return false;
          }
        });

    },

    'buttons': [

      // Set button
      {
        text: 'Apply',
        click: async () => {

          // set processing button
          dialog.setProcessing( 'Apply' );

          // get select function
          const fkt = $content.find( '.options option:selected' )
                              .data( 'module' );

          // get selected column
          const col = curParams.col.getID();

          // issue command
          await curParams['ds'].execCommand( 'unbag', {
                            'data_id': curParams.ds.getDataID(),
                            'col':     col,
                            'agg':     fkt['module']
                          });

          // reenable buttons
          dialog.setProcessing();

          // close dialog
          dialog.close();

        }
      },{
        text:     'Cancel',
        'class':  'secondary',
        click:    () => dialog.close()
      },

    ]

  });



  /**
   * check, whether the function-description "desc" allows datatype "subdatatype"
   */
  function functionApplicable( subdatatype, desc ) {

    // it is applicable to the elements data type
    if( desc.datatype.includes( subdatatype ) ) {
      return true;
    }

    // it is applicable to any datatype
    if( desc.datatype.includes( 'all' ) ) {
      return true;
    }

    // applicable to bagged types, need matching subdatatype
    if( desc.datatype.includes( 'bag' ) || desc.datatype.includes( 'set' ) ) {

      if( !('subdatatype' in desc)
          || desc.subdatatype.includes( 'all' )
          || desc.subdatatype.includes( subdatatype ) ) {
        // no subdatatype is an implicit "all"
        // subdatatype matches
        return true;
      }

    }

    // nothing matched
    return false;

  }

});