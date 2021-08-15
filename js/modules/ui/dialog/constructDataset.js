"use strict";
/**
 * construct a dataset out of given columns/values
 */
define( ['jquery',
         'jquery-ui',
         'moment',
         'basic/Constants',
         'config/server',
         'ui/basic/Yavaa.global',
         'ui/dialog/constructDataset/tabQuery',
         'ui/dialog/constructDataset/tabResult',
         'ui/dialog/constructDataset/tabDistr',
         'ui/dialog/constructDataset/tabAdjust',
         'ui/dialog/constructDataset/getExecRequest',
         'text!template/ui/dialog/constructDataset.htm',
         'ui/dialog/Wrapper',
         'util/requirePromise'
         ],
function($,
         jqueryUI,
         Moment,
         Constants,
         Cfg,
         Y,
         tabQueryInit,
         tabResultInit,
         tabDistrInit,
         tabAdjustInit,
         getExecRequest,
         templ,
         DialogWrapper,
         requireP ){

  // init dialog content
  const $content = $( templ ),
        mHeight  = $( 'body' ).height() * 0.5,
        $tabs    = $content
                    .find( '.tabs' )
                    .tabs()
                    .css( 'max-height', mHeight );

  // local settings
  let localCfg = {
      dateFormat: 'Y.m.d',
      dateFormatMoment: 'YYYY.MM.DD',

      // selectors
      tabQuery:       '#constructDatasetTabs1',
      tabResult:      '#constructDatasetTabs2',
      tabDistr:       '#constructDatasetTabs3',
      tabDistrChart:  '#constructDatasetTabs3 .distrChart svg',
      tabDistrList:   '#constructDatasetTabs3 ul',
      tabAdjust:      '#constructDatasetTabs4',
      tabAdjustList:  '#constructDatasetTabs4 ul'

  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Dialog Buttons XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * cancel button in dialog
   */
  function dialogCancel(){

    // clear old inputs
    $content.find( localCfg.tabQueryItems ).remove();
    $content.find( localCfg.tabResultList ).empty();
    $content.find( localCfg.tabDistrList ).empty();
    $content.find( localCfg.tabDistrChart ).empty();
    $content.find( localCfg.tabAdjustList ).empty();

    // close the dialog
    dialog.close();

  }

  /**
   * Search button in dialog
   */
  async function dialogSearch(){

    // set processing button
    dialog.setProcessing( 'Search' );

    // hide any shown error message
    dialog.hideError();

    // disable result tabs
    $tabs.tabs( 'option', 'disabled', [ 1,2,3 ] );

    // retrieve all current set columns/values
    let query = tabQuery.serializeInputs();

    // at least two columns needed
    if( query.length < 2 ) {

      // no results, show error
      dialog.showError( 'noinput' );

      // reenable buttons
      dialog.setProcessing();
      dialog.setDisabled( 'Execute' );

      return;

    }

    // retrieve terms
    const msg = await Y.CommBroker.execCommand({
                                    'action': 'getDsByCombination',
                                    'params': {
                                      'constraints': query
                                    }
                                  });

    // shortcut
    const results = msg.params;

    // are there any results?
    if( results.result == null ) {

      // no results, show error
      dialog.showError( 'noresult' );

      // reenable buttons
      dialog.setProcessing();
      dialog.setDisabled( 'Execute' );

      return;

    }

    // get list of resolvable URIs
    const uris = getResolveURIs( query, results.components, results.result );

    // request labels for those URIs
    let uriLookup = {};
    if( uris.length > 0 ) {

      // request the labels
      const labelResponse = await Y.CommBroker
                                    .execCommand({
                                      'action': 'resolveLabels',
                                      'params': {
                                        'uris': uris
                                      }
                                    });

      // get list of resolved uris
      uriLookup = labelResponse.params.results;

    }

    // attach data to dialog
    $content.data( 'result', results );

    // update tabs
    await Promise.all( [ tabResult.update( query, results.result, uriLookup ),
                         tabDistr.update(  results.components, uriLookup ),
                         tabAdjust.update( results.components, uriLookup ) ] );

    // do we need the adjust tab?
    const disabledAdjust = !!$content.find( localCfg.tabAdjust ).data( 'disabled' );
    if( disabledAdjust ){

      // enable all but adjust tab
      $tabs.tabs( 'option', 'disabled', [3] );

    } else {

      // enable all result tabs
      $tabs.tabs( 'option', 'disabled', false );

    }

    // reenable the buttons
    dialog.setProcessing();

    // set focus on second tab
    $tabs.tabs( "option", "active", 1 );

    // UNION is currently not supported
    function containsUnion( pwf ) {
      if( typeof pwf == 'number' ) {
        return false;
      } else {
        return (('op' in pwf) && (pwf.op == 'U')) || containsUnion( pwf.op1 ) || containsUnion( pwf.op2 );
      }
    }
    if( containsUnion( results.pwf ) ) {

      // no results, show error
      dialog.showError( 'unsupport' );

      // reenable buttons
      dialog.setDisabled( 'Execute' );

      return;

    }
  }

  /**
   * test button
   *
   * fills the query form and the results with sample data
   */
  async function sampleTest() {

    tabQuery.setCols([
      {
        col: {id: "http://eurostat.linked-statistics.org/dic/geo", "label":"Geopolitical entity (reporting)","type": Constants.DATATYPE.SEMANTIC},
        vals: [
          { id: "http://eurostat.linked-statistics.org/dic/geo#DE", "label":"Germany"},
          { id: "http://eurostat.linked-statistics.org/dic/geo#IE", "label":"Ireland"},
          { id: "http://eurostat.linked-statistics.org/dic/geo#IS", "label":"Iceland"},
          { id: "http://eurostat.linked-statistics.org/dic/geo#ES", "label":"Spain"},
          { id: "http://eurostat.linked-statistics.org/dic/geo#RO", "label":"Romania"},
        ]
      },{
        col: {id: "http://eurostat.linked-statistics.org/dic/time", "label":"Time","type": Constants.DATATYPE.TIME},
        vals: [],
        vals: {
          min: '2013-01-01',
          max: '2018-01-01'
        }
      },{
        col: {id: "http://yavaa.org/ns/eurostat/meas/numberOfSheep",  "label":"Number of sheep",  "type": Constants.DATATYPE.NUMERIC},
        vals: []
      },{
        col: {id: "http://yavaa.org/ns/eurostat/meas/population",  "label":"Population",  "type": Constants.DATATYPE.NUMERIC},
        vals: []
      }

    ]);

    return;

  }


  /**
   * execute the currently active selection, if possible
   */
  async function dialogExec(){

    // set processing button
    dialog.setProcessing( 'Execute' );

    // get pseudo workflow
    let pwf = getExecRequest( $content );

    // load some dependencies
    const Dataset = await requireP( 'ui/basic/types/Dataset' );

    // execute
    const cmd = {
        'action': 'execWorkflow',
        'params': {
          'workflow': pwf,
          'wfType':  'pwf'
        }
      };
    const msg = await Y.CommBroker.execCommand( cmd );

    // create respective dataset
    const ds = new Dataset( msg.params.data_id, 'data', cmd );

    // add dataset
    Y.UIBroker.addDataset( ds );

    // show in content view
    Y.UIBroker.showView( ds, 'data' );

    // close dialog
    dialog.close();

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX collect resolvable URIs XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * extract a list of URIs used within request and result
   *
   * @param     {Array}         query         the query as submitted to the server
   * @param     {Array}         components    list of involved datasets
   * @param     {Array}         results       final resulting dataset
   * @returns   {Array[String]}               list of URIs
   */
  function getResolveURIs( query, components, results ) {

    // TODO recycle result from orginal query
    // TODO recycle labels already transmitted

    // collection for resolvable URIs - no duplicates
    let uris = new Set();

    // walk through all found datasets
    components
      .forEach( (ds) => {

        // the dataset itself
        uris.add( ds.ds );

        // the publisher
        uris.add( ds.dsPublisher );

        // from all columns ...
        ds.columns
          .filter( (col) => col )
          // ... get their concept
          .forEach( (col) => {

            uris.add( col.concept );

          });

        // from all columns ...
        ds.columns
        // ... get the codelist ones ...
          .filter( (col) => col && (col.datatype == Constants.DATATYPE.SEMANTIC) && ('usedRange' in col) )
        // ... and add their values ...
          .forEach( (col) => {

            col
              .usedRange
              .forEach( (val) => uris.add( val ) );

          });

      });

    // also add URIs from query
    query
        .forEach( (col) => {

          // get concept
          uris.add( col.concept );

        })
      // and just from the codelist ones ...
   query
      .filter( (col) => col && (col.datatype == Constants.DATATYPE.SEMANTIC) && col.colEnums && (col.colEnums.length > 0) )
      .forEach( (col) => {

        // ... add values
        col
          .colEnums
          .forEach( (val) => uris.add( val ) );

      });

    // return list of found uris
    return [ ... uris ];

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // init tabs
  const tabQuery  = tabQueryInit(  $content, $content.find( localCfg.tabQuery ),  localCfg ),
        tabResult = tabResultInit( $content, $content.find( localCfg.tabResult ), localCfg ),
        tabDistr  = tabDistrInit(  $content, $content.find( localCfg.tabDistr ),  localCfg ),
        tabAdjust = tabAdjustInit( $content, $content.find( localCfg.tabAdjust ), localCfg );

  // create dialog
  let dialog;
  return dialog = new DialogWrapper( $content, {
    'buttons': [

      {
        text:  'Test',
        class: 'secondary',
        click: sampleTest
      },

      {
        text:  'Search',
        click: dialogSearch
      },

      {
        text:  'Execute',
        click: dialogExec
      },

      {
        text:  'Cancel',
        class: 'secondary',
        click: dialogCancel
      },

      // include test button only, when not in production mode
    ].filter( (btn, i) => !Cfg.isProduction || (i != 0) ),

    'close': function(){

      // clean the form
      $content.find( '.inputlist > li:not(:last-child)' ).remove();
      $content.find( '.inputlist input' ).val( '' );

    },

    'beforeOpen': function() {

      // hide any shown error message
      dialog.hideError();

      // remove any previous processing state
      dialog.setProcessing();

      // disable the execute button until a search has been completed
      dialog.setDisabled( 'Execute', true );

      // disable result tabs
      $tabs.tabs( 'option', 'disabled', [ 1,2,3 ] );

      // set focus on first tab
      $tabs.tabs( "option", "active", 0 );

      // clean first tab
      tabQuery.reset();

    }

  });

});