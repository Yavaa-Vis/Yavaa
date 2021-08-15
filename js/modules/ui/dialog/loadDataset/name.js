"use strict";
/**
 * load a dataset by giving its ID
 *
 */
define( [
          'jquery',
          'config/server',
         ],
function(
          $,
          cfg
         ){

  // list of valid events
  const validEvents = [ 'change' ];


  return class loadDatasetByName {

    constructor( $tab ){

      // init the object
      this._events = {};
      this._tab = $tab;

      // keep track of some elements
      this._els = {
        input: $tab.find( 'input' ),
      };

      // if NOT in production mode set a testing dataset
      if( !cfg.isProduction ){
        this._els.input.val( 'http://yavaa.org/ns/eurostat/dsd#tps00001' );
      }

      // attach change event to input field
      this._els.input.on( 'input keyup keydown click change',
                            () => this.trigger( 'change' ) );

      // attach as handler to the tab
      $tab.data( 'handler', this );

      // remember the default value
      this._default = this._els.input.val();

    }

    /**
     * checks, whether the current input is valid and load could be triggered
     */
    isValid(){
      return (this._els.input.val().trim() != '');
    }


    /**
     * return the dataset to load
     * equals the param object of the load command
     */
    getInput(){
      return this._els.input.val();
    }


    /**
     * registers an event listener
     */
    on( event, cb ) {

      // normalize
      event = event.toLowerCase();

      // validate the event
      if( !validEvents.includes( event ) ) {
        throw new Exception( `Unkown event: ${event}`);
      }

      // register
      this._events[ event ] = this._events[ event ] || [];
      this._events[ event ].push( cb );

    }

    /**
     * fires the given event
     */
    trigger( event ) {

      // normalize
      event = event.toLowerCase();

      // validate the event
      if( !validEvents.includes( event ) ) {
        throw new Exception( `Unkown event: ${event}`);
      }

      // fire all callbacks
      for( let cb of this._events[ event ] ){
        cb( this );
      }

    }


    /**
     * reset all input forms for this tab
     */
    reset(){
      this._els.input.val( this._default );
    }

  }

});