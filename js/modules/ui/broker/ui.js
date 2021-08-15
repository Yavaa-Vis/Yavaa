"use strict";
define( [  'jquery',
           'ui/basic/Yavaa.global',
           'ui/views/data',
           'ui/views/wf',
           'ui/views/viz',
           'ui/handler/dsNav',
           'ui/handler/viewNav',
           'ui/handler/menu',
           'ui/broker/ui/State',
           'util/requirePromise' ],
function(   $,
            Y,
            dataView,
            wfView,
            vizView,
            DsNav,
            ViewNav,
            Menu,
            State,
            requireP
         ){

  /*
   * manage the UI:
   * - change currently shown dataset/workflow/viz
   */


  /**
   * @constructor
   */
  const UIBroker = {};

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX SETUP XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  const cfg = {
      'data':         '#content-data',
      'viz':          '#content-viz',
      'wf':           '#content-wf',
      'viewNavBtns':  '.viewNavBtn',
      'viewNavCont':  '#viewSwitch',
      'datasetNav':   '#dataSwitch',
      'undo':         '#menu .undo',
      'redo':         '#menu .redo',
      'sessionId':    '#sessionId span',
    };

  // components
  const dsNav   = new DsNav( cfg['datasetNav'] ),
        viewNav = new ViewNav( cfg );

  // save UI state
  const uiState = new State( dsNav );

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX DIALOGS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // enable opening dialogs for all
  UIBroker.dialog = async function( diag, param ){

    // after being disconnected, only the reload dialog may open
    if( $('body').hasClass( 'yavaa-disconnected') && (diag != 'reload') ) {
      return;
    }

    // load respective dialog definition
    const dialog = await requireP( 'ui/dialog/' + diag );

    // open respective dialog
    dialog.open( param );

  };


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX addDataset XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  UIBroker.addDataset = function addDataset( ds ) {

    // add to dataset switcher
    dsNav.add( ds );

    // activate
    dsNav.setActive( ds );

    // activate viewNav
    viewNav.setActive( true );

    // notify the state
    uiState.addDataset( ds );

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX removeDataset XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  UIBroker.removeDataset = function removeDataset( ds ) {

    // remove from dataset menu
    dsNav.remove( ds );

    // remove from state
    uiState.removeDataset( ds );

    // render the new dataset
    ds = uiState.curDs;
    if( ds ) {
      this.showView( ds, ds.getView() || 'data' );
    } else {
      
    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX listDatasets XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  UIBroker.listDatasets = function listDatasets() {
    return dsNav.list();
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getActiveDataset XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return the dataset that is currently shown
   */
  UIBroker.getActiveDataset = function getActiveDataset() {
    return uiState.curDs;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX disableDsSpecificMenu XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return the dataset that is currently shown
   */
  UIBroker.disableDsSpecificMenu = function disableDsSpecificMenu() {
    Menu.setDsSpecific( false );
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX setSessionId XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * show the current session id
   */
  UIBroker.setSessionId = function setSessionId( sessionId ) {
    $( cfg.sessionId ).text( sessionId );
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Session / State XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * try to restore a previous session
   */
  UIBroker.restoreSession = function restoreSession() {
    uiState.restore();
  }


  /**
   * reset the state to start fresh
   */
  UIBroker.resetState = function resetState() {
    uiState.reset();
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  showView XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * update given view panel with content for the given dataset
   * @param   ds            {Number}    the respective dataset to update with
   * @param   view          {String}    the view to update
   * @param   forceUpdate   {Boolean}   make sure the current view is updated
   */
  UIBroker.showView = async function showView( ds, view, forceUpdate ) {

    // no ds given, so use the current one
    if( !ds ) {
      ds = uiState.curDs;
    }

    // we have no active dataset yet
    if( ds == null ) {
      return;
    }

    // if second parameter is boolean, we have to switch around a little
    if( typeof view == 'boolean' ) {
      forceUpdate = view;
      view = null;
    }

    // default view is last view
    if( !view ) {
      view = uiState.curDs.getView();
    }

    // TODO caching ?

    // set ds active
    uiState.curDs = ds;
    dsNav.setActive( ds );

    // show correct view
    ds.setView( view );
    viewNav.goView( view );

    // trigger engine calls
    switch( view ) {

      case 'data':        /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX view: data */

        // update table
        await dataView.show( cfg.data, ds, forceUpdate );

        break;

      case 'viz':         /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX view: viz  */

        // create viz
        await vizView.show( cfg.viz, ds, forceUpdate );

        break;

      case 'wf':          /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX view: wf   */

        // show workflow
        await wfView.show( cfg.wf, ds, forceUpdate );

        break;

      default:
        // we don't know that view
        throw Error( 'Unknown view: ' + view );
    }

    // enabled/disable undo/redo
    Menu.setDo( 'undo', ds.canUndo() );
    Menu.setDo( 'redo', ds.canRedo() );

    // enable dataset specific buttons
    Menu.setDsSpecific( true );

    // update state
    uiState.changeDataset( ds );

  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  showView XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * reset all views to their initial state
   */
  UIBroker.resetViews = async function resetViews() {

    // reset all views
    await Promise.all([
      dataView.reset( cfg.data ),
      vizView.reset(  cfg.viz ),
      wfView.reset(   cfg.wf ),
    ]);

    // reset state
    uiState.curDs = null;

  }

  // attach to global object
  Y.UIBroker = UIBroker;

});