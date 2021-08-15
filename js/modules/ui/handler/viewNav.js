"use strict";
define( [ 'jquery',
          'ui/basic/Yavaa.global'],
function( $,
          Y
){

  /*
   * enables the navigation between views
   * set default view
   */

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX CONFIG XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  const viewOrder = [ 'wf', 'data', 'viz'];

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX CONSTRUCTOR XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function viewNav( props ) {

    // save link to elements
    this._$views = {
        data: $( props['data'] ),
        viz:  $( props['viz'] ),
        wf:   $( props['wf'] )
    };

    // link to nav container
    this._$cont = $( props['viewNavCont'] );

    // link navigation buttons
    this._$btns = $( props['viewNavBtns'] );

    // attach handler for navigation buttons
    this._$btns.click( clickHandler );

    // link this viewNav object to buttons
    this._$btns.data( 'viewNavBtns', this );

    // currently enabled view
    this._curView = null;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX setActive XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  viewNav.prototype.setActive = function( active ) {
    if( active ) {
      this._$cont.addClass( 'active' );
    } else {
      this._$cont.removeClass( 'active' );
    }
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX showView XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  viewNav.prototype.goView = function( view ) {

    // only valid views ...
    if( !(view in this._$views) ) {
      throw new Error( 'Unknown view: ' + view );
      return;
    }

    // hide old view
    this._curView && this._$views[ this._curView ].hide();

    // remember
    this._curView = view;

    // show new view
    this._$views[ view ].show();

    // get index of view in viewOrder
    var index = viewOrder.indexOf( view );

    // adjust nav links
    this._$btns.each( function(){

      // jqueryfy
      var $this = $(this);

      // update target
      if( $this.hasClass('left') ) {
        $this.data( 'target', viewOrder[ (3 + index - 1) % viewOrder.length ] );
      } else {
        $this.data( 'target', viewOrder[ (3 + index + 1) % viewOrder.length ] );
      }

    });

  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX clickHandler XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function clickHandler(){

    // get target view and respective index
    var target = $( this ).data( 'target' );

    // delegate to UIBroker
    Y.UIBroker.showView( null, target );

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX EXPORT XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return viewNav;

});