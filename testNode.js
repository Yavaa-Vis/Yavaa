"use strict";
/**
 *
 * executes all tests as specified in /tests/_test.json
 *
 * optional command line argument specified, which test bundle to execute
 * if none specified, all will be executed
 *
 */


// includes
let QUnit = require('qunit'),
    Util  = require( 'util' ),
    Path  = require( 'path' );

// clear screen
console.log( '\u001b[2J' );

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX PREPARATIONS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

// set timeout for tests
QUnit.config.testTimeout = 30 * 1000;
QUnit.config.autostart = false;

const testResults = {};
let failedTests = [];

// (failed) tests
QUnit.log( function(details) {

  if (!details.result) {
    failedTests.push( details );
  }

});

// module start
QUnit.moduleStart( function( details ){

  // extract group
  let group = details.name.split( ':' )[0];

  // add all objects to results
  testResults[ group ] = testResults[ group ] || {};
  testResults[ group ][ details.name ] = testResults[ group ][ details.name ] || { 'total': null, 'failed': null, 'tests': [] };

});

// module summary
QUnit.moduleDone( function( details ){

  // extract group
  let group = details.name.split( ':' )[0];

  // add all objects to results
  testResults[ group ][ details.name ][ 'total' ] = details;

});

// test begin
QUnit.testStart( function( details ){
});

// test end
QUnit.testDone( function( details ){

  // extract group
  let group = details.module.split( ':' )[0];

  // add all objects to results
  testResults[ group ] = testResults[ group ] || {};
  testResults[ group ][ details.module ] = testResults[ group ][ details.module ] || { 'total': null, 'failed': null, 'tests': [] };

  // add test result
  testResults[ group ][ details.module ]['tests'].push( details );

  // maybe add failedTests
  if( failedTests.length > 0 ) {
    details['_failedTests'] = failedTests;
    failedTests = [];
  }

});

QUnit.done( output );

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ACTUAL TESTS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

(async function() {

  // check, if a test is specified as parameter
  let testcase = null;
  if( process.argv.length > 2 ) {
    testcase = process.argv[2];
  }

  //Setup RequireJS
  const RequireJS = require( __dirname + '/lib/requirejs/r' );
  RequireJS.config({
    'baseUrl': __dirname + '/js/modules',
    'nodeRequire': require,
    'paths': {
      'asserts':                __dirname + '/test_customAsserts',
      'd3':                     __dirname + '/lib/d3.js/d3.min',
      'testdata':               __dirname + '/tests/testdata',
      'template':               __dirname + '/template',
      'text':                   __dirname + '/lib/requirejs/text',
      'moment':                 __dirname + '/lib/moment.js/moment',
      'tests':                  __dirname
    }
  });
  RequireJS.onError = (e) => console.log( e );

  //get test to run
  const testList = require( Path.join( __dirname, 'tests', '_tests.json' ) );

  const modules = Object.keys( testList )
                        .filter( function( testname ){
                          return ((testname !== 'test') || (testcase === 'test'))
                                 && ((testcase === null) || (testname == testcase));
                        });
  for( let module of modules) {

    const tests = testList[ module ];

    for( let test of tests ) {

      // load test
      const testmodule = await requireP( 'tests/' + test );

      // run it
      await testmodule( QUnit );

    }

  }

  // warning, if no testmodules
  if( modules.length < 1 ){
    console.log( colored( 'No tests found!', 'yellow' ) );
  }

  // actual execute
  QUnit.load();
  QUnit.start();

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function requireP( module ) {
    return new Promise( (resolve, reject) => {
      RequireJS( [ module ], resolve );
    });
  }

})()
  .catch( (e) => console.log( e ) );



/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Output XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

function output(){

  // collect total stats
  const stats ={
      module: 0,
      test:    0,
      test_passed: 0,
      test_failed: 0,
      assertion: 0,
      assertion_passed: 0,
      assertion_failed: 0,
  };

  // get testgroups
  let groupNames = Object.keys( testResults );

  for( let i=0; i<groupNames.length; i++ ) {

    // amount of '-' for marking as header
    let headerCount = 100 - groupNames[i].length;
    headerCount = Math.floor( headerCount / 2 );
    headerCount = Math.max( 0, headerCount )
    let header = Array( headerCount ).fill( '-' );


    // output start group
    console.log();
    console.log( colored(
          ((groupNames[i].length % 2 == 1) && headerCount > 0 ? '-' : '')
          + header.join('') + ' '
          + groupNames[i]
          + ' ' + header.join(''), 'yellow' ) );

    // get modules
    let moduleNames = Object.keys( testResults[ groupNames[i] ] );

    for( let j=0; j<moduleNames.length; j++ ) {

      // shortcut
      let module = testResults[ groupNames[i] ][ moduleNames[j] ];

      // announce module start
      console.log();
      console.log( colored( 'STARTING - ' + moduleNames[j], 'bold' ) );

      // individual tests
      for( let k=0; k<module['tests'].length; k++) {

        // grab test details; shortcut
        let details = module['tests'][k];

        let color = (details.passed == details.total ) ? 'green' : 'red';
        let output = colored( "   " + details.name + ' P/T: ' + details.passed + '/' + details.total, color );
        console.log( output );

        // possibly failed tests
        if( '_failedTests' in details ) {
          for( let l=0; l<details['_failedTests'].length; l++ ) {

            // shortcut
            let failure = details['_failedTests'][l];

            // create error message
            let output = colored( "       FAILED: ", 'red' );
            if( typeof failure.expected !== 'undefined' ) {

              // test went wrong

              // output
              output += failure.message ? failure.message + " " : "";
              output += "\n           expected: " + serialize( failure.expected ).replace( /\n/g, "\n                     " )
                      + "\n           actual:   " + serialize( failure.actual   ).replace( /\n/g, "\n                     " );

            } else {

              // exception in test
              output += failure.message + "\n" + failure.source;

            }
            console.log( output );
          }
        }

        // collect stats
        stats.test += 1;
        stats.test_passed += ('_failedTests' in details) ? 0 : 1;
        stats.test_failed += ('_failedTests' in details) ? 1 : 0;

      }

      // announce module end
      const color  = (module['total'].passed == module['total'].total ) ? 'green' : 'red';
      const output = colored( "FINISHED - " + module['total'].name + ' P/T: ' + module['total'].passed + '/' + module['total'].total, color );
      console.log( output );

      // collect stats
      stats.module += 1;
      stats.assertion += module['total'].total;
      stats.assertion_passed += module['total'].passed;
      stats.assertion_failed += (module['total'].total - module['total'].passed);

    }

  }

  // output final stats
  console.log( );
  console.log( colored( 'Statistics'.toUpperCase(), 'bold' ) );
  console.log(          '==========' );
  console.log( colored( `Modules: ${stats.module}`, 'bold' ) );
  console.log( colored( `Tests: ${stats.test}`, 'bold' ) );
  console.log( colored( `   passed: ${stats.test_passed}`, 'green' ) );
  console.log( colored( `   failed: ${stats.test_failed}`, 'red' ) );
  console.log( colored( `Assertions: ${stats.assertion}`, 'bold' ) );
  console.log( colored( `   passed: ${stats.assertion_passed}`, 'green' ) );
  console.log( colored( `   failed: ${stats.assertion_failed}`, 'red' ) );

}


/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX HELPER FUNCTIONS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

function serialize( obj )  {

  // handle some special cases
  switch( true ) {
    case Number.isNaN( obj ):   return 'NaN';
    case obj instanceof Set:    return 'Set( ' + JSON.stringify( [ ... obj ] ) + ' )';
    default:                    return Util.inspect( obj, {showHidden: false, depth: null}); // http://stackoverflow.com/a/10729284/1169798
  }

}


function colored( input, color ) {
  let codes = {
      normal: '\x1b[0m',
      italic: '\x1b[3m',
      bold:   '\x1b[1m',
      'black':    '\x1b[90m',
      'red':      '\x1b[91m',
      'green':    '\x1b[92m',
      'yellow':   '\x1b[93m',
      'blue':     '\x1b[94m',
      'magenta':  '\x1b[95m',
      'cyan':     '\x1b[96m',
      'white':    '\x1b[97m'
    };

  if( color in codes ) {
    return codes[ color ] + input + codes.normal;
  } else {
    return input;
  }
}