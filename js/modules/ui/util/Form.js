"use strict";
/**
 * create an HTML form by given parameters
 *
 * {
 *    legend:     <string>
 *    elements:   <array>
 *    container:  <jQuery|selector>
 * }
 *
 * Element
 * {
 *    id:           <string>
 *    desc:         <string>
 *    label:        <string>
 *    placeholder:  <string>
 *    type:         <string|text|number|bool|enum>
 *    value:        <string>
 *
 *    values:       <array<{ label: (string), value: (string) }>=>      // only enum
 *    min:          <number>              // only number
 *    max:          <number>              // only number
 *    step:         <number>              // only number
 * }
 */
define([ 'jquery' ], function( $ ){

  /**
   * create the HTML elements need for the given form an attach them to the DOM
   *
   * @constructor
   * @param   {string|jQuery}   target
   * @param   {Object}          settings
   */
  function Form( target, settings ) {

    // store given parameters
    this._$target = $( target );
    this._settings = settings;

    // store link to form
    this._$form = null;
    this._$els = {};

    // store events
    this._events = {};

    // create the form
    this._create();

    // append to target
    if( this._$target.length > 0 ) {
      this._$target.append( this._$form );
    }
  }

  /**
   * build the form
   */
  Form.prototype._create = function create(){

    // general form
    this._$form = $( '<section class="form" />' );
    if( 'legend' in this._settings ) {
      this._$form.append( `<h3>${this._settings['legend'] }</h3>` );
    }
    const $formEls = $( '<section />' );
    this._$form.append( $formEls );

    // specific elements
    let $el, $label, $entry, el,
        changeHandler = this._inputChange.bind( this );
    for( let i=0; i<this._settings['elements'].length; i++ ) {

      // shortcut
      el = this._settings['elements'][ i ];

      // input element itself
      switch( el['type'] ) {

        case 'text': $el = $( '<textarea />' );
                     break;

        case 'number': $el = $( '<input type="number" />' );
                       $el .attr( 'min',  el['min'] )
                           .attr( 'max',  el['max'] )
                           .attr( 'step', el['step'] );
                       break;

        case 'string': $el = $( '<input type="text" />' );
                       break;

        case 'bool': $el = $( '<input type="checkbox" />' );
                     break;

        case 'enum': let $opt, opts = [];

                     for( let j=0; j<el['values'].length; j++ ) {
                       $opt = $( '<option />' );
                       $opt.attr( 'value', el['values'][j]['value'] )
                           .text( el['values'][j]['label'] );
                       opts.push( $opt );
                     }
                     $el = $( '<select />' );
                     $el.append( opts );
                     break;

        // we don't know anything else ...
        default: throw new Error( 'Unknown type: ' + el['type'] );

      }

      // some common attributes
      $el .attr( 'name', el['id'] )
          .attr( 'placeholder', el['placeholder'] )
          .val( el['value'] )
          .on( 'change', changeHandler );

      // add to input element list and remember key
      this._$els[ el.id ] = $el;
      $el.data( 'key', el.id );

      // create label
      $label = $( '<span class="label" />' );
      $label.text( el['desc'] )
            .attr( 'title', el['label'] );

      // encapsulate everything
      $entry = $( '<label class="input" />' );
      $entry.append( $el, $label );

      // add to form
      $formEls.append( $entry );
    }

  }

  /**
   * return the values for all input fields of this form
   *
   * @return {Object}
   */
  Form.prototype.getValues = function getValues(){

    const res = {},
          keys = Object.keys( this._$els );
    for( let i=0; i<keys.length; i++ ) {

      if( this._$els[ keys[i] ].attr( 'type' ) == 'checkbox' ) {
        res[ keys[i] ] = this._$els[ keys[i] ].is( ':checked' );
      } else {
        res[ keys[i] ] = this._$els[ keys[i] ].val();
      }

    }
    return res;

  }

  /**
   * react on some events
   * @param   {string}    event
   * @param   {Function}  cb
   * @return  {Form}
   */
  Form.prototype.on = function on( event, cb ) {

    // save it
    this._events[ event ] = this._events[ event ] || [];
    this._events[ event ].push( cb );

    // for chaining
    return this;
  }


  /**
   * react on change within the input elements
   */
  Form.prototype._inputChange = function _inputChange( evt ) {

    // if there are no callbacks, we have nothing to do here
    if( !this._events[ 'change' ] || (this._events[ 'change' ].length < 1)){
      return;
    }

    // shortcut
    const $el = $( evt.target ),
          key = $el.data( 'key' );
    let val;
    if( $el.attr( 'type' ) == 'checkbox' ) {
      val = $el.is( ':checked' );
    } else {
      val = $el.val();
    }

    // call all callbacks
    for( let i=0; i<this._events['change'].length; i++ ) {
      this._events['change'][i].call( evt.target, key, val );
    }

  }

  return Form;

});