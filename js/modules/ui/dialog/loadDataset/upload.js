"use strict";
/**
 * load a dataset by giving its ID
 *
 */
define( ['jquery',
         'util/requirePromise',
         'load/loader/List',
         'ui/util/Form',
         'datatables'
         ],
function($,
         requireP,
         ParserList,
         FormGen
         ){

  // list of valid events
  const validEvents = [ 'change' ];


  return class loadDatasetByUpload {

    constructor( $tab ){

      // init the object
      this._events = {};
      this._tab = $tab;

      // keep track of some elements
      this._els = {
        input:    $tab.find( '#loadDataset_file' ),
        testbtn:  $tab.find( '.loadDataset_testparse' ),
      };

      // attach change event to input field
      this._els.input.on( 'input keyup keydown click change',
                            () => {
                              const files = this._els.input.get(0).files;
                              this._els.testbtn[ files && (files.length > 0) ? 'removeAttr' : 'attr' ]( 'disabled', true );
                            });

      // init the tab
      init( this, $tab );

      // attach as handler to the tab
      $tab.data( 'handler', this );

      // remember the default value
      this._default = this._els.input.val();

    }

    /**
     * checks, whether the current input is valid and load could be triggered
     */
    isValid(){
      // get last test run's settings
      const settings = this._tab.data( 'settings' );

      // settings will only be set after testrun
      // needed to be valid
      return !!settings;
    }


    /**
     * return the dataset to load
     * equals the param object of the load command
     */
    getInput(){

      // get parser names
      const parser = [],
            parserUsed = this._tab.data( 'parser' );
      for( let i=0; i<parserUsed.length; i++ ) {
        parser.push( parserUsed[i].prototype['_type'] );
      }

      // collect all information needed
      return {
        module:   this._tab.data( 'module' ),
        file:     this._tab.data( 'file' ),
        settings: this._tab.data( 'settings'),
        parser:   parser,
      };

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

      this._els.input.val( '' );
      this._tab.find( '.loadDataset_testoutput' ).html( '' );
      this._tab.find( '.loadDataset_settings' ).html( '' );
      this._tab .removeData( 'module' )
                .removeData( 'settings' )
                .removeData( 'file' )
                .removeData( 'parser' );
    }

  }



  /**
   * initialize the functionality within the tab
   */
  function init( handler, $tab ) {

    // currently active state (includes current parser, data, settings etc)
    let state = {};

    // insert parser list
    let parser = ParserList.map( p => `<option title="${p.desc}" value="${p.module}">${p.name}</option>`);
    $tab.find( '.parserlist' ).html( parser.join('') );
    parser = undefined;

    // guessing the correct parser
    $tab.find( '#loadDataset_file' )
      .on( 'change', () => {

        // get file
        const files = $tab.find( '#loadDataset_file' ).get(0).files;
        if( !files || (files.length < 1) ) { return; }
        const file = files[0];

        // get extension - http://stackoverflow.com/a/1203361/1169798
        const ext = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);

        // reset settings
        state = {};
        $tab.find( '.settings' ).html( '' );

        // search for match within parser list
        const parser = ParserList.find( p => p.ext.includes( ext ) );
        if( parser ) {

          // found a match - set the respective option
          $tab.find( '.parserlist' ).val( parser.module );

        }

      });

    // enable test parse button
    $tab.find( '.loadDataset_testparse' )
      .on( 'click', async () => {

      // get currently active parser
      const module = $tab.find( '.parserlist' ).val();

      // load parser and description
      const [ parser, desc ] = await requireP( ['load/loader/' + module,
                                                'load/loader/' + module + '.desc'] );

      // get file
      const files = $tab.find( '#loadDataset_file' ).get(0).files;
      if( files.length < 1 ) {
        return;
      }
      const data = await loadFile( files[0] );

      // do we already have settings?
      if( state['settings'] ) {
        state['settings'][ 'rows' ] = 10;
      } else {
        state['settings'] = {
            'rows': 10,
        };
      }

      // parse it
      const res = await parser( data, null, state['settings'] );

      // save some stuff
      state = {
          'module':     module,
          'settings':   res.settings,
          'file':       data,
          'parser':     res.parser
      };

      // convert data from column to row based
      const rData = [];
      for( let i=0; i<res.data[0].length; i++ ) {
        const row = [];
        for( var j=0; j<res.data.length; j++ ) {
          row.push( res.data[j][i].toString() );
        }
        rData.push( row );
      }

      // convert header
      const header = [];
      for( var i=0; i<res.header.length; i++ ) {
        header.push({ title: res.header[i] });
      }

      // show data table
      const $table = $( '<table></table>' );
      $table.DataTable({
          'dom':      '',
          'columns':  header,
          'data':     rData,
          'ordering': false,
      });
      $tab.find( '.loadDataset_testoutput' ).html('').append( $table );

      // show settings for review
      const options = [];
      for( var i=0; i<desc.settings.length; i++ ) {
        if( desc.settings[i].show ) {

          options.push({
            'type':   desc.settings[i].type,
            'id':     desc.settings[i].key,
            'label':  desc.settings[i].key,
            'value':  res.settings[ desc.settings[i].key ],
            'desc':   desc.settings[i].desc
          });

        }
      }
      const $cont = $tab.find( '.loadDataset_settings' ).html( '' ),
            form  = new FormGen( $cont, {
                      'elements': options,
                      'legend':   $cont.data( 'legend' )
                    });

      // react on changes
      form.on( 'change', function( key, val ){
        state['settings'][ key ] = val;
      });

      // save settings
      $tab.data( 'settings', state['settings'] );
      $tab.data( 'parser',   state['parser'] );
      $tab.data( 'module',   module );
      $tab.data( 'file',     data );

      // trigger change event on handler
      handler.trigger( 'change' );

    });


  }


  /**
   * load a file from the given file input
   */
  function loadFile( file ) {

    return new Promise( (resolve,reject) => {
      const fr = new FileReader();

      // read file
      fr.readAsText( file, 'utf8' );
      fr.addEventListener( 'load',  (res) => resolve( fr.result ) );
      fr.addEventListener( 'error', reject );

    });
  }

});