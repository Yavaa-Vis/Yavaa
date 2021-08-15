"use strict";
/**
 * dialog for showing the given datasets metadata
 */
define( ['jquery',
         'jquery-ui',
         'basic/Constants',
         'text!template/ui/dialog/showMeta.htm',
         'text!template/ui/common/value.htm',
         'ui/basic/Overlay',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Constants,
          template,
          templateValue,
          Overlay,
          DialogWrapper
         ){

  // dialog content
  const $content = $( template );

  // template items
  const $templ = {
      colRange:  $content.find( '#metadataColRange' ).contents(),
      colItem:   $content.find( '#metadataColItem' ).contents(),
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': async function( params ){

      // get list of columns
      const cols = await params.ds.getColumnMeta();

      // create entries for all columns
      const colPromises = cols.map( async (c) => {

                            try {
                              // get the column icon entry
                              const $col = await c.getTemplate();

                              // get the distinct values
                              const values = await c.getColumnValues()

                              // get entry
                              let $val;
                              switch( c.getDatatype() ) {

                                case Constants.DATATYPE.SEMANTIC:
                                case Constants.DATATYPE.STRING:
                                  values.list.sort( (a,b) => a.label.localeCompare( b.label ) );
                                  $val = values.list.map( (el) => createValueIcon( el.label ) );
                                  break;

                                case Constants.DATATYPE.NUMERIC:
                                case Constants.DATATYPE.TIME:
                                  $val = $templ.colRange.clone( true );
                                  const $min = createValueIcon( values.minFormated || values.min || 'none' ),
                                        $max = createValueIcon( values.maxFormated || values.max || 'none' );
                                  $val.find( '.from' ).append( $min );
                                  $val.find( '.to' ).append( $max );
                                  break;

                              }

                              // create an entry
                              const $entry = $templ.colItem.clone( true );
                              $entry.find( '.col' ).append( $col );
                              $entry.find( '.val' ).append( $val );

                              // done
                              return $entry;

                            } catch(e) {
                              console.log(e);
                            }

                          });
      const $cols = await Promise.all( colPromises );

      // add
      $content.find( '.columns' )
              .html( '' )
              .append( $cols );

    },

    'buttons': [{
      text:     'Close',
      'class':  'secondary',
      click:    () => dialog.close()
    }]

  });


  /**
   * create a single icon for a value
   */
  function createValueIcon( label ) {
    const html = templateValue
                    .replace( /{classes}/g,  '' )
                    .replace( /{uri}/g,      '' )
                    .replace( /{label}/g,    label );
    return $( html );
  }

});