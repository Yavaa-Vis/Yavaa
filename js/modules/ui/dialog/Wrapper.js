"use strict";
/**
 * Wrapper object for the dialogs
 * provides the following methods:
 * - open( parameters )
 */
define( [ 'jquery',
          'jquery-ui',
          'ui/basic/Yavaa.global',
          'ui/basic/Overlay',
          'text!template/ui/common/extLink.htm'
], function( $, jQueryUI, Y, Overlay, templLink ){

  // list of events, we handle ourselves (not delegated to jQuery UI)
  const events = [ 'beforeOpen', 'afterOpen' ];

  // id counter to be sure, that created ids are unique
  let idCounter = 0;

  /**
   * create a wrapper around the given dialog
   */
  function DialogWrapper( dialogEl, userParam ){

    // we might need a reference
    const self = this;

    // convert button list to array
    const btns = [];
    if( 'buttons' in userParam ) {

      // collect buttons in array
      if( userParam.buttons instanceof Array ) {
        Array.prototype.push.apply( btns, userParam.buttons );
      } else {
        Object.keys( userParam.buttons )
              .forEach( (name) => {
                btns.push({
                  text:   name,
                  click:  userParam.buttons[ name ]
                });
              })
      }

      // assign ids to all, that have none
      for( let i=0; i<btns.length; i++ ) {
        if( !('id' in btns[i]) ) {
            btns[i].id = 'dialogBtn' + (idCounter++);
        }
      }

    }

    // set default values for dialog parameters and enhance with user set ones
    // order: defaultParam < userParam < events
    const param = $.extend({
      'autoOpen':       false,
      'modal':          true,
      'resizable':      false,
      'closeOnEscape':  true,
      'position': {
        'my': 'center top',
        'at': 'center top+10%',
        'of': 'body'
      },
      'width':          '80%',
      'height':         'auto',


    }, userParam, {

      // replace the close icon
      // http://stackoverflow.com/a/7910817/1169798
      'create': function(){
        const widget = $(this).dialog("widget");
        $(".ui-dialog-titlebar-close", widget)
          .html( "\uf057" );
        if ( 'create' in userParam ) {
          userParam.create( ...arguments )
        }
      },

      // remove the overlay upon close
      'close': function() {
        if( self.overlay ) {
          self.overlay.remove();
        }
        if ( 'close' in userParam ) {
          userParam.close( ...arguments )
        }
      },

    });

    // set buttons
    param.buttons = btns;

    // create dialog
    const dialog = $( dialogEl ).dialog( param );
    dialog.css( 'z-index', 200 );

    // add help link, if available
    const helpLink = $( dialogEl ).data( 'help' );
    if( helpLink ) {

      // get a link to the dialog container and the header row
      const $container = $( dialog ).closest( '.ui-dialog' ),
            $header    = $container.find( '.ui-dialog-titlebar' );

      // create help link
      const link = templLink.replace( /{uri}/gi,      helpLink )
                            .replace( /{label}/gi,    '\uf059' )
                            .replace( /{classes}/gi,  'helplink' );

      // insert after title
      $header.find( '.ui-dialog-title' )
             .after( link );

    }

    // collect callbacks, we handle on our own
    Object.defineProperty( this, '_cb', { 'value': {} });
    events
      .forEach( (event) => {
        if( event in userParam ) {
          this['_cb'][ event ] = userParam[ event ];
        }
      });

    // add close handler for error messages
    dialog.on( 'click', '.errMsg', () => this.hideError() );

    // add dialog to this
    Object.defineProperty( this, '_dialog', {
      'value': dialog
    });

    // add param to this (will be set per open call)
    Object.defineProperty( this, '_param', {
      'value':  null,
      writable: true
    });

    // add setup parameters (used to initialize the dialog)
    Object.defineProperty( this, '_dialogParam', {
      'value':  param,
      writable: false
    });

    return this;
  }


  /**
   * open the dialog and pass the given parameters to it
   */
  DialogWrapper.prototype['open'] = async function open( param ) {

    // use overlay
    this.overlay = new Overlay( $( 'body' ), false );

    // save params
    this['_param'] = param || this['_param'];

    // disable processing
    this.setProcessing();

    // trigger beforeOpen events
    await this['_triggerEvent']( 'beforeOpen' );

    // remove the loading spinner
    this.overlay.toggleSpinner();

    // open the dialog
    this['_dialog'].dialog( 'open' );

    // trigger afterOpen events
    await this['_triggerEvent']( 'afterOpen' );

  };


  /**
   * execute all callbacks bound to the respective event
   * @params  {String}    event       name of the event
   */
  DialogWrapper.prototype['_triggerEvent'] = async function _triggerEvent( event ){

    // make sure we have a string
    event = String( event );

    try{

      // execute callbacks
      if( event in this['_cb'] ) {
        await this['_cb'][event]( this['_param'] );
      }

    } catch( e ) {
      // show error
      Y.UIBroker.dialog( 'showError', {
        'error':  e
      });
      return;
    }
  }


  /**
   * adjust the dialog container to the (new) size of the content
   */
  DialogWrapper.prototype['resize'] = function resize(){

  }


  /**
   * get a jquery reference to a specific button
   * @params  {Number}    index     index of the button in the parameter list
   */
  DialogWrapper.prototype['getButton'] = function getButton( index ) {

    // is it a valid index?
    index = Math.trunc( Number( index ) );
    const paramLength = this._dialogParam.buttons.length;
    if( (paramLength <= index) || (index < 0) ){
      return null;
    }

    // get respective param object for button
    const paramBtn = this._dialogParam.buttons[ index ]

    // return the respective button
    return this._dialog.dialog( 'widget' ).find( '#' + paramBtn.id );

  }



  /**
   * get a jquery references to all control buttons
   * excluding those within the content area
   */
  DialogWrapper.prototype['getButtons'] = function getButtons() {

    // return the respective button
    return this._dialog.dialog( 'widget' ).find( '.ui-dialog-buttonset button' );

  }

  /**
   * active or deactivate processing state for this dialog
   * while processing all buttons are deactivated and one button has the processing state
   * no transmitted button removes the processing state from the dialog
   * @params  {Number|String}    index     index or title of the processing button
   */
  DialogWrapper.prototype['setProcessing'] = function setProcessing( index ) {

    // get all buttons
    const $btns = this.getButtons();

    if( typeof index !== 'undefined' ) {

      // enable processing

      // disable them
      $btns.prop( 'disabled', true );

      // find processing button
      let processingBtn;
      switch( typeof index ) {
        case 'string':  processingBtn = this._dialogParam.buttons.find( (b) => b.text == index );
                        break;
        case 'number':  processingBtn = this._dialogParam.buttons[ index ];
                        break;
      }

      // add processing
      if( processingBtn ){
        const $btn = this._dialog.dialog( 'widget' ).find( '#' + processingBtn.id );
        $btn.attr( 'data-processing', true );
      }

    } else {

      // disable processing

      // reenable buttons
      $btns.prop( 'disabled', false );

      // remove processing
      $btns.removeAttr( 'data-processing' );

    }

  }


  /**
   * disable particular buttons
   * omitted status equals disabled property
   * @params  {Number|String}   index     index or title of the button
   * @params  {Boolean}         status    new status; default: true
   */
  DialogWrapper.prototype['setDisabled'] = function setDisabled( index, status ) {

    // default value for status
    if( status !== false ) {
      status = true;
    }

    // find processing button descriptor
    let btn;
    switch( typeof index ) {
      case 'string':  btn = this._dialogParam.buttons.find( (b) => b.text == index );
                      break;
      case 'number':  btn = this._dialogParam.buttons[ index ];
                      break;
    }

    // get the respective button DOM element
    const $btn = this._dialog.dialog( 'widget' ).find( '#' + btn.id );

    // no button no action
    if( !btn || !$btn ) {
      return;
    }

    // set new status
    $btn.prop( 'disabled', status );

  }


  /**
   * show the error message given by name
   * @params    {String}    name      the name of the error message as specified within the template
   */
  DialogWrapper.prototype['showError'] = function showError( name ) {

    // get error container
    const $errContainer = this._dialog.dialog( 'widget' ).find( '.errMsg' );

    // find respective message
    const $errMsg = $errContainer.find( '[data-name="' + name + '"]' );

    // if we missed something, we do nothing
    if( ($errContainer.length < 1) || ($errMsg.length < 1) ){
      return;
    }

    // hide all error messages
    $errContainer.find( '[data-name]' ).hide();

    // show the current message and the container
    $errMsg.show();
    $errContainer.show();

  }


  /**
   * hide error messages
   */
  DialogWrapper.prototype['hideError'] = function hideError() {

    // get error container
    const $errContainer = this._dialog.dialog( 'widget' ).find( '.errMsg' );

    // hide all error messages
    $errContainer.hide();

  }


  /**
   * show the error message given by name
   * @params    {String}    name      the name of the error message as specified within the template
   */
  DialogWrapper.prototype['showInfo'] = function showInfo( name ) {

    // get error container
    const $infoContainer = this._dialog.dialog( 'widget' ).find( '.infoMsg' );

    // find respective message
    const $infoMsg = $infoContainer.find( '[data-name="' + name + '"]' );

    // if we missed something, we do nothing
    if( ($infoContainer.length < 1) || ($infoMsg.length < 1) ){
      return;
    }

    // hide all error messages
    $infoContainer.find( '[data-name]' ).hide();

    // show the current message and the container
    $infoMsg.show();
    $infoContainer.show();

  }


  /**
   * hide error messages
   */
  DialogWrapper.prototype['hideInfo'] = function hideInfo() {

    // get error container
    const $infoContainer = this._dialog.dialog( 'widget' ).find( '.infoMsg' );

    // hide all error messages
    $infoContainer.hide();

  }


  /**
   * close the dialog
   */
  DialogWrapper.prototype['close'] = function close(){

    this['_dialog'].dialog( 'close' );

  }

  return DialogWrapper;
});