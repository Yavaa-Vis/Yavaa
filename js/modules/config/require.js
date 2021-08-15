!function(){

  // determine the require.js module - adapted from Q

  // CommonJS
  if (typeof exports === 'object' && typeof module === 'object') {

    module.exports = function( RequireJS ) {
      doCfg( RequireJS, true );
    }

  // <script>
  } else if (typeof window !== 'undefined' || typeof self !== 'undefined') {

    doCfg( requirejs, false );

  } else {
      throw new Error( 'This environment was not anticipated.' );
  }


  function doCfg( req, isNode ) {

    // get base path for everything
    var basePath;
    if( isNode ) {
      basePath = require( 'path' ).join( __dirname, '..', '..', '..' );
    } else {
      basePath = '';
    }

    // do the actual config
    req.config({

      'baseUrl': basePath + '/js/modules',
      'nodeRequire': require,

      // shims
      'shim': {
        'papaparse': {
          'exports': 'Papa'
        },
        'd3': {
          'exports': 'd3'
        }
      },

      // paths
      'paths': {
        'd3':        basePath + '/lib/d3.js/d3.min',
        'moment':    basePath + '/lib/moment.js/moment',
        'papaparse': basePath + '/lib/PapaParse/papaparse',
        'pegjs':     basePath + '/lib/peg.js/peg.min.js',
        'template':  basePath + '/template',
        'text':      basePath + '/lib/requirejs/text',
      },

      // suppress some warnings
      'suppress': {
        'nodeShim': true
      }

    });
    if( typeof req.isWorker == 'undefined' ) {
      req.isWorker = !req.isBrowser && (typeof importScripts !== 'undefined');
    }

  }

}();