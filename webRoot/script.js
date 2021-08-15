// config
requirejs.config({

    //By default load any module IDs from js/lib
    'baseUrl': './js/modules',
    // shims
    'shim': {
      'socketio': {
        'exports': 'io'
      },
      'scroller': {
        'deps': ['datatables'],
        'exports': 'datatables'
      },
      'jquery.ui-contextmenu': {
        'deps': ['jquery', 'jquery-ui'],
        'exports': 'jquery'
      },
      'jquery.datetimepicker': {
        'deps': ['jquery'],
        'exports': 'jquery'
      },
      'datatables':{
        'deps': ['jquery'],
        'exports': 'jquery'
      },
      'codemirror.simple':{
        'deps': ['codemirror'],
        'exports': 'CodeMirror'
      }
    },
    'paths': {
      'template':               '../../template',
      'text':                   '../../lib/requirejs/text',
      'socketio':               '../../lib/socket.io/socket.io',
      'jquery':                 '../../lib/jquery/jquery.min',
      'jquery-ui':              '../../lib/jquery/jquery-ui.min',
      'datatables':             '../../lib/jquery/jquery.dataTables.min',
      'scroller':               '../../lib/jquery/datatables.scroller.min',
      'jquery.ui-contextmenu':  '../../lib/jquery/jquery.ui-contextmenu.min',
      'jquery.datetimepicker':  '../../lib/jquery/jquery.datetimepicker',
      'moment':                 '../../lib/moment.js/moment.min',
      'papaparse':              '../../lib/PapaParse/papaparse.min',
      'd3':                     '../../lib/d3.js/d3.min',
      'codemirror':             '../../lib/codemirror/codemirror',
      'codemirror.simple':      '../../lib/codemirror/codemirror.simple',
      'pegjs':                  '../../lib/peg.js/peg.min',
    }
});

// error handler
requirejs.onError = function( err ) {
    require( ['ui/basic/Yavaa.global', 'basic/error', 'ui/basic/logger'], function( Y, error, log ){

      // wrap into custom error object
      const customErr = error( 'client', err );

      // send to server side logging
      if( Y.CommBroker.isReady() ){ 
        Y.CommBroker.logError( customErr );
      }

      // log to console
      if( console ) {
        console.error( customErr );
      }

      // show in dialog
      Y.UIBroker.dialog( 'showError', {
        'error': customErr,
      });

      // log to app-log
      log( customErr );

    });
};

// execute start
requirejs( ['ui/main'] );