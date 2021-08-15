"use strict";
/**
 * assert equality of two given ASTs
 *
 * things to no
 */
define( [ 'basic/types/ArbNumber' ], function( ArbNumber ){

  // get qunit
  var QUnit     = require( 'qunit' );

  /*
   * assertion function
   */
  function yavaa_astEqual( actual, expected, message ){

    // actual has to be an object
    let result = actual instanceof Object;

    // recursively check the AST
    result = result && checkRec( actual, expected );

    // report result
    // parameter order: result, actual, expected, message, negative
    if( result ) {
      this.pushResult( { result, actual, expected, message } );
    } else {
      this.pushResult({
        result,
        actual: serializeAst( actual ),
        expected: serializeAst( expected ),
        message
      });
    }

  }


  // attach to QUnit
  QUnit.assert.yavaa_astEqual = yavaa_astEqual;



  /**
   * recursively traverse and check the AST
   */
  function checkRec( act, ref ) {

    // check the fields at this node: type
    if( act.type  !== ref.type ) {
      return false;
    }

    // compare value (depends on type)
    if( ref.type == 0 ) {

      // constant numbers

      // convert to ArbNumber
      var a1 = (act.value instanceof ArbNumber) ? act.value : ArbNumber( act.value ),
          a2 = ArbNumber( ref.value );

      // compare
      if( a1.compare( a2 ) != 0 ) {
        return false;
      }

    } else {

      // all other
      if( act.value !== ref.value ) {
        return false;
      }

    }

    // check children
    if( ref.children ) {

      // check children count
      if( !act.children
          || (act.children.length !== ref.children.length) ) {
        return false;
      }

      // division and subtraction are order sensitive
      // rest is not
      if( ['-','/'].indexOf( act.value ) > -2 ) {

        // compare in order
        for( var i=0; i<ref.children.length; i++ ) {
          if( !checkRec( act.children[i], ref.children[i] ) ) {
            return false;
          }
        }

      }

    }

    // all ok
    return true;
  }


  function serializeAst( ast ) {
    return JSON.stringify( ast, function( key, val ){
      if( [ 'parent'].indexOf( key ) < 0 ) {
        return val;
      }
    })
  }

});
