"use strict";
/**
 * compare if every item, that is present in expected is also present in actual
 *
 * notes:
 * * weaker comparison than deepEqual
 * * properties from actual do not need to be in expected
 */
define( [], function(){

  // get qunit
  var QUnit     = require( 'qunit' );

  /*
   * assertion function
   */
  function yavaa_deepIncluded( actual, expected, message ){

    // actual has to be an object
    var res = actual instanceof Object;

    // recursively check the AST
    res = res && checkIncluded( actual, expected );

    // report result
    // parameter order: result, actual, expected, message, negative
    this.pushResult({
      result: res,
      actual,
      expected,
      message
    });

  }


  // attach to QUnit
  QUnit.assert.yavaa_deepIncluded = yavaa_deepIncluded;


  /**
   * do the actual comparison
   *
   * @param actual
   * @param expected
   * @returns
   */
  function checkIncluded( actual, expected ) {

    // both have to be of the same type
    if( typeof actual != typeof expected ) {
      return false;
    }

    switch( true ) {

      // null
      case expected === null:             return actual === null;

      // arrays
      case expected instanceof Array:     return expected.every( (el, ind) => checkIncluded( actual[ind], el ) );

      // objects
      case typeof expected == 'object':   return Object.keys( expected )
                                                        .every( (key) => {

                                                          // property needs to be present
                                                          if( !(key in actual) ) { return false; }

                                                          // values need to match
                                                          if( typeof expected[ key ] == 'object' ) {
                                                            return ( actual[ key ] === expected[ key ])              // shortcut, if actual and expected are defined by the same objects
                                                                   || checkIncluded( actual[key], expected[key] );
                                                          } else {
                                                            return actual[ key ] === expected[ key ];
                                                          }

                                                        });

      // primitives
      default:                            return actual === expected;

    }

  }

});
