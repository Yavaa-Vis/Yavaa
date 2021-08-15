"use strict";
/**
 * change or set the unit for a given column
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/setUnit.htm',
         'text!template/ui/dialog/setUnit/unitItem.htm',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Y,
          templ,
          templUnitItem,
          DialogWrapper
         ){

  // dialog content
  const $content = $( templ );

  // link to elements
  var $els = {
      systems:  $content.find( '.systems' ),
      units:    $content.find( '.units' ),
      from:     $content.find( '.from' ),
      to:       $content.find( '.to' ),
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXCXXXXXXXXXX Setup XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // system select box
  $els.systems
    .on( 'change', function(){

      // get selected system
      const selSystem = $(this).find(':selected').data( 'system' ) ;

      // show all items
      $els.units.find( 'li' ).show();

      // hide unselected unnits
      if( selSystem ) {

        // get unit data
        const data = $content.data( 'unitData' );

        // the selected system
        const system = data.systems.find( (el) => el.uri == selSystem );

        // hide entries not listed
        $els
          .units
          .find( 'li' )
          .filter( (ind) => !system.units.includes( ind ) )
          .hide();
      }

    });

  // units selection
  $els.units
    .on( 'change', 'input[type="radio"]', function(){
      const $this = $(this);
      if( $this.is(':checked') ){
        $els.to.text( $this.parent().text() );
      }
    });

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Data Retrieval XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  async function getData( unit ) {

    // get data items
    const response = await Y.CommBroker
                        .execCommand({
                          'action': 'getCompatibleUnits',
                          'params': {
                            'unit': unit
                          }
                        }),
          data = response.params;

    // store with popup
    $content.data( 'unitData', data );

    // fill systems selection
    const systems = data.systems
                        .sort( (a,b) => {
                          return a.label.localeCompare( b.label );
                        })
                        .map( (sys) => {
                          return '<option data-system="' + sys.uri + '">' + sys.label + '</option>';
                        });
    systems.unshift( '<option>all</option>' );
    $els.systems.html( systems.join('') );

    // add unit list
    const units = data.units
                      .map( (entry, ind) => {
                        const checked = unit.getURI() == entry.uri ? 'checked' : '';
                        return templUnitItem.replace( /{uri}/gi,   entry.uri )
                                            .replace( /{label}/gi, entry.label )
                                            .replace( /{checked}/gi, checked )
                                            .replace( /{index}/gi, ind );
                      });
    $els.units.html( units.join( '' ) );

    // scroll current unit into view
    const target    = $els.units.find( 'input:checked' ).closest( 'li' ).get(0),
          container = $els.units.get( 0 ),
          seenHeight  = container.clientHeight,
          elHeight    = target.clientHeight,
          elTop       = target.offsetTop,
          pos = elTop - container.offsetTop - seenHeight/2 + elHeight/2;
    $els.units.animate({scrollTop: pos});

  }



  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'beforeOpen': function( param ){

      // save data
      $content.data( 'request', param );

      // get data
      const col  = param.col,
            unit = col.getUnit();

      // set current unit in from field
      if( unit ) {
        $els.from.text( unit.getLabel() );
        $els.to.text( unit.getLabel() );
      } else {
        $els.from.text( '[no unit]' );
        $els.to.text( '[no unit]' );
      }

      // clean input fields
      $els.units.empty();
      $els.systems.empty();

      // fill with data
      getData( unit );

    },

    'buttons': [

      // Set button
      {
        text: 'Apply',
        click: async () => {

          // set processing button
          dialog.setProcessing( 'Apply' );

          // get request parameter
          const param = $content.data( 'request' );

          // get old unit
          const oldUnit = param.col.getUnit();

          // get new unit
          const newUnit = $els.units.find( 'input:checked' ).val();

          // if no change happened, just end here
          if( oldUnit && (oldUnit.getURI() == newUnit) ) {
            dialog.close();
            return;
          }

          // collect data for request
          const req = {
              data_id: param.ds.getID(),
              col_id:  param.colIndex,
              unit:    newUnit
          }

          // issue command
          await param.ds.execCommand( 'setUnit', req );

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

});