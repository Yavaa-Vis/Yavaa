"use strict";
/**
 * overlay to a specific element to signal that the content is currently loading
 */
define( [ 'jquery',
          'text!template/ui/elements/overlayLoading.htm',
], function( $,
             templ
){

  /**
   * Create an overlay for the target element
   * @constructor
   * @param {String|Object}   target        the element over which the overlay shall appear
   * @param {Boolean}         hideLoading   hide/show the loading animation?
   */
  function Overlay( target, hideLoading ) {

    // make sure, we get a jQuery object and store it
    this._target = $( target );

    // make sure $target has some other 'position' value than 'static'
    if( this._target.css( 'position' ) == 'static' ) {
      this._target.css( 'position', 'relative' );
    }

    // create overlay with appropriate dimensions
    this._overlay = $( templ );
    if( this._target.is( 'body' ) ) {
      this._overlay.css( 'width',   '100%' );
      this._overlay.css( 'height',  '100%' );

    } else {
      this._overlay.css( 'width',   this._target.css('width') );
      this._overlay.css( 'height',  this._target.css('height') );
    }

    // hide the spinner, if requested
    this._spinner = this._overlay.find( 'svg' );
    if( hideLoading ) {
      this._spinner.hide();
    } else {
      this._spinner.show();
    }

    // append to target element
    this._target.append( this._overlay );
  }


  /**
   * remove the respective overlay again
   */
  Overlay.prototype['remove'] = function(){
    this._overlay.remove();
  }


  /**
   * toggle the loading spinner
   */
  Overlay.prototype['toggleSpinner'] = function(){
    if( this._spinner.is( ':visible' ) ) {
      this._spinner.hide()
    } else {
      this._spinner.show();
    }
  }

  // export
  return Overlay;

});