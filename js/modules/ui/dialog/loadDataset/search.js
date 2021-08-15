"use strict";
/**
 * dialog for dataset search
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'basic/Constants',
         'config/server',
         'text!template/ui/dialog/loadDataset/search_resultItem.htm',
         'text!template/ui/dialog/loadDataset/search_details.htm',
         'text!template/ui/common/dataset.htm',
         'text!template/ui/common/column.htm',
         'text!template/ui/common/column_dim.htm',
         'text!template/ui/common/column_meas.htm',
         'ui/basic/Overlay' ],
function( $,
          jqueryUI,
          Y,
          Constants,
          cfg,
          templResultItem,
          templResultDetails,
          templDataset,
          templResultCol,
          templResultColDim,
          templResultColMeas,
          Overlay
         ){

  // list of valid events
  const validEvents = [ 'change' ];

  // some regexp needed
  const regexp = {
      cols:     /{cols}/gi,
      ds:       /{ds}/gi,
      src:      /{src}/gi,
      srcLabel: /{srcLabel}/gi,
      title:    /{title}/gi,
      label:    /{label}/gi,
      uri:      /{uri}/gi,
      order:    /{order}/gi,
  };

  return class loadDatasetByKeyword {

    constructor( $tab ){

      // init the object
      this._events = {};
      this._tab = $tab;

      // keep track of some elements
      this._els = {
        inpKeyword: $tab.find( '#search_keywords' ),
        inpButton:  $tab.find( '#search_button' ),
        btnGo:      $tab.find( '#search_go' ),
        results:    $tab.find( '#search_results' ),
        details:    $tab.find( '#search_details' ),
      };

      // if NOT in production mode set a testing dataset
      if( !cfg.isProduction ){
        this._els.inpKeyword.val( 'sex' );
      }

      // init the tab
      this.init()

      // attach as handler to the tab
      $tab.data( 'handler', this );

      // remember the default value
      this._default = this._els.inpKeyword.val();

      // attach autocomplete
      this._els.inpKeyword.autocomplete({

            // number of characters, before autocomplete is activated
            minLength: 1,

            // get terms for autocomplete
            source: async function( req, res ){

              // shortcut
              const $el = $( this.element );

              // retrieve terms
              const data = await Y.CommBroker.execCommand({
                                                'action': 'typeAhead',
                                                'params': {
                                                  'needle':   $el.val(),
                                                  'type':     'dataset',
                                                }
                                              });

               // transform result
               const terms  = data['params']['terms'];
               const uniqueTerms = new Set();
               Object.keys( terms )
                     .forEach( t => uniqueTerms.add( terms[t].label ) );

               // return values
               res( [ ... uniqueTerms ].map( (t) => { return { id: t, label: t }; } ) );

            },

            // react on selected item
            select: (ev, ui) => {
              this._els.inpKeyword.val( ui.item.label );
              this._els.inpKeyword.trigger( $.Event( 'keypress', { which: $.ui.keyCode.ENTER } ) );
            },

            // quickfix some bug, where the autocomplete is hidden behind the popup
            close: () => {
              this._tab.closest( '.ui-dialog' ).css( 'z-index', '' );
            },

      });

    }

    /**
     * checks, whether the current input is valid and load could be triggered
     */
    isValid(){
      return (this._els.details.data( 'data_id' ) != '');
    }


    /**
     * return the dataset to load
     * equals the param object of the load command
     */
    getInput(){
      return this._els.details.data( 'data_id' );
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
      this._els.inpKeyword.val( this._default );
      this._els.details.data( 'data_id', '' );
      this._els.results.empty();
      this._els.details.empty();
    }


    /**
     * init tab functionalities
     */
    init() {

      // trigger search upon enter pressed
      this._els.inpKeyword.on( 'keypress', ( e ) => {
        const keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == 13) {
          this._els.inpButton.trigger( 'click' );
        }
      });

      // attach event handlers
      this._els.inpButton.on( 'click', async () =>{

        // set button to processing
        this._els.inpButton.attr( 'data-processing', true );

        // clear result column
        this._els.details.empty();
        this._els.details.data( 'data_id', '' );
        this.trigger( 'change' );

        // issue command
        const data = await Y.CommBroker
                            .execCommand({
                              'action': 'search',
                              'params': {
                                'restrictions':{
                                  'keywords': this._els.inpKeyword.val()
                                }
                              }
                            });

         // get the results
         const results = data['params']['results'];

         // display results
         this.showResults( results );

         // remove processing from button
         this._els.inpButton.removeAttr( 'data-processing' );

      });

      // attach details click event
      this._els.results.on( 'click', 'div[data-id]', (ev) => this.showDetails(ev.target) );

    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Display Results XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    /**
     * display results
     * @param res
     */
    showResults( res ) {

      // insert results into templates
      const out = [];
      for( let i=0; i<res.length; i++ ){

        // dataset
        const ds = templDataset.replace( regexp.label, res[i]['title'] )
                               .replace( regexp.uri,   res[i]['ds'] );

        // entry
        const entry = templResultItem
                         .replace( regexp.title,    ds )
                         .replace( regexp.uri,      res[i]['ds'] )
                         .replace( regexp.src,      res[i]['src'] )
                         .replace( regexp.srcLabel, res[i]['srcLabel'] || res[i]['src'] )

        // to jQuery object
        const $entry = $(entry);

        // adjust the dataset object a little
        $entry.find( '.dataset' ).addClass( 'nobreak' );

        // add to results
        out.push( $entry );

      }


      // insert to output
      this._els.results.html( '' ).append( out );

    }


    /**
     * show details for a specific search result
     */
    async showDetails( target ) {

      // shortcuts
      const $target = $(target).closest( '[data-id]' );

      // mark as selected
      this._els.results.find( '.selected' ).removeClass( 'selected' );
      $target.addClass( 'selected' );

      // get the respective id
      const id = $target.data('id');

      // add overlay to
      const detailsOverlay = new Overlay( this._els.details );

      // retrieve details
      const data = await Y.CommBroker
                          .execCommand({
                            'action': 'getDsDetails',
                            'params': {
                              'id': id
                            }
                          })

      // create column output
      const outCols = [];
      data['params']['cols'].forEach(function( col ){

        // Select template type
        let templ;
        switch( col.role ) {
          case Constants.ROLE.DIM:  templ = templResultColDim; break;
          case Constants.ROLE.MEAS: templ = templResultColMeas; break;
          default:                  templ = templResultCol;
        }

        // add to output
        outCols.push(
            templ.replace( regexp.label, col['label'] )
                 .replace( regexp.order, col['order'] )
                 .replace( regexp.uri,   col['uri'] )
        );
      });

      // clone the original dataset tag HTML
      const ds = $target.find( '.tag.dataset' ).get( 0 ).outerHTML;

      // create the output
      const out = templResultDetails
                    .replace( regexp.ds,    ds )
                    .replace( regexp.src,   data['params']['meta']['src'] )
                    .replace( regexp.cols,  outCols.join('\n') )
                    .replace( regexp.ds,    id );

      // to jQuery object
      const $out = $(out);

      // do the output
      this._els.details.html( out );

      // store link to dataset id
      this._els.details.data( 'data_id', id );

      // remove overlay
      detailsOverlay.remove();

      // let others know there is a new result
      this.trigger( 'change' );
    }

  }

});