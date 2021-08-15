"use strict";
/**
 * additional dialog to change the current view on the data
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/changeView.htm',
         'ui/dialog/Wrapper' ],
function( $,
          jqueryUI,
          Y,
          templ,
          DialogWrapper
         ){

  // dialog content
  const $content = $( templ );
  
  // link to the current parameter set
  let curParam = null;

  /**
   * initial setup of elements
   */
  function setup() {

    // we only want to setup upon the first opening
    if( $content.find( '.element').length > 3 ) {
      return;
    }

    // copy elements
    const invisEls = $content.find( '.element' ).clone( true );
    $content.find( '.elements' ).append([
      invisEls,
      $content.find( '.element' ),
      invisEls.clone( true ),
    ]);
    const $elements = $content.find( '.element' );

    // get maximum width of elements
    // https://stackoverflow.com/a/5784399/1169798
    const maxWidth  = Math.max.apply(Math, invisEls.map(function(){ return $(this).outerWidth(); }).get()),
          maxHeight = Math.max.apply(Math, invisEls.map(function(){ return $(this).outerHeight(); }).get());

    // set all widths
    $elements.css({
      'width':  `${maxWidth}px`,
      'height': `${maxHeight}px`,
    });
    $( '.elements' ).css({
      'width':  `${3*maxWidth}px`,
      'height': `${maxHeight}px`,
    });

    // position all elements
    const lefts = [
       `-${maxWidth}px`,  `-${maxWidth}px`,  `-${maxWidth}px`,  // elements to the left
                      0,   `${maxWidth}px`, `${2*maxWidth}px`,  // elements in the middle (shown)
      `${3*maxWidth}px`, `${3*maxWidth}px`, `${3*maxWidth}px`,  // elements to the right
    ];
    for( let i=0; i<lefts.length; i++ ) {
      $elements.eq( i ).css( 'left', lefts[i] );
    }

    // navigation buttons
    $content.find( '[data-nav]' )
      .on( 'click', function(){

        // get direction
        const dir = ($(this).data( 'nav') == 'prev') ? -1 : +1;

        // get elements to animate
        const $els = (dir < 0) ? $( '.element' ).slice( 3, 7 ) : $( '.element' ).slice( 2, 6 );

        // make the transition
        $els.animate({
          left: `${ (dir<0) ? '-' : '+' }=${maxWidth}`
        });

        // move the first/last element around
        if( dir < 0 ) {
          $('.element:first-child')
            .stop( true )
            .css( 'left', `${3*maxWidth}px` )
            .appendTo( $('.elements') );
        } else {
          $('.element:last-child')
            .stop( true )
            .css( 'left', `-${maxWidth}px` )
            .prependTo( $('.elements') );
        }

        // set selection on container element
        const view = $content.find( '.element:nth-child(5)' ).data( 'view' );
        $content.find( '.container' ).attr( 'data-view', view );

      });

    // navigation by clicking on the element itself
    $content.find( '.element' )
      .on( 'click', function(){

        // get position
        centerSelection( $(this).data( 'view' ) );

      });

    // cycle current view to center
    const curView = curParam.ds.getView();
    $content.find( '.container' ).attr( 'data-view', curView );
    centerSelection( curView );

  }

  /**
   * cycle the selected view to the center
   * @param   {String}      curView     the view to cycle to
   */
  function centerSelection( curView ) {
    
    switch( true ) {
    
      // move one to the right
      case ($( '.element:nth-child(4)' ).data( 'view' ) == curView):
        $( '[data-nav="next"]' ).trigger( 'click' );
        break;
    
      // move one to the left
      case ($( '.element:nth-child(6)' ).data( 'view' ) == curView):
        $( '[data-nav="prev"]' ).trigger( 'click' );
        break;
    
      // nothing to change (element is already in center)
      default:
        break;
    
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // return wrapped version
  let dialog;
  return dialog = new DialogWrapper( $content, {

    'afterOpen': setup,

    'beforeOpen': function( params ){

      // save the params
      curParam = params;

      // cycle current view to center
      const curView = curParam.ds.getView();
      centerSelection( curView );

    },

    'buttons': [

      {
        text:  'Change',
        click: async () => {

          // container element holds the new view
          const view = $content.find( '.container' ).data( 'view' );

          // set the new view
          await Y.UIBroker.showView( curParam.ds, view );

          // close the dialog
          dialog.close();

        }
      },


      {
        text:     'Cancel',
        'class':  'secondary',
        click:    () => dialog.close(),
      },

    ]

  });

});
