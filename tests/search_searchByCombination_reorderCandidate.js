"use strict";
/**
 * reorderCandidate
 * params:
 * - region
 * - candidate
 */

define( [ 'search/searchByCombination/reorderCandidate',
          'testdata/search_searchByCombination'],
function( reorderCandidate,
          testData
){

  return function( QUnit ) {

    QUnit.module( 'search/searchByCombination/reorderCandidate: Simple tests, artifical data' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX single column XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'single column, exact match', function( assert ){

      let res, exp;

      // numeric
      res = reorderCandidate( testData['1ColNumeric_0to10'], testData['1ColNumeric_0to10'] );
      exp = testData['1ColNumeric_0to10'];
      assert.deepEqual( res, exp, 'order adjusted' );

    });
    

    QUnit.test( 'single column, changed position', function( assert ){

      let res, exp;

      // numeric
      res = reorderCandidate( testData['2ColMixed'], testData['1ColEnum'] );
      exp = [ null, testData['1ColEnum'][0] ];
      assert.deepEqual( res, exp, 'order adjusted' );

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX multiple columns XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'multiple columns, exact match', function( assert ){

      let res, exp, cand;

      // numeric
      cand = testData['2ColMixed']
      res = reorderCandidate( testData['2ColMixed'], cand );
      exp = testData['2ColMixed'];
      assert.deepEqual( res, exp, 'order adjusted' );

    });
    

    QUnit.test( 'multiple columns, changed position', function( assert ){

      let res, exp, cand;

      // numeric
      cand = [ testData['2ColMixed'][1], testData['2ColMixed'][0] ];
      res = reorderCandidate( testData['2ColMixed'], cand );
      exp = testData['2ColMixed'];
      assert.deepEqual( res, exp, 'order adjusted' );

    });
    

    QUnit.test( 'multiple columns, changed position, superflous column at end', function( assert ){

      let res, exp, cand;

      // numeric
      cand = cloneObject( [ testData['2ColMixed'][1], testData['2ColMixed'][0], testData['1ColDate'][0] ] );
      cand.forEach( (col, ind ) => { col.order = ind; } );
      exp  = cloneObject( cand );
      exp = [ exp[1], exp[0], exp[2] ];
      res = reorderCandidate( testData['2ColMixed'], cand );
      assert.deepEqual( res, exp, 'order adjusted' );

    });
    
    QUnit.test( 'multiple columns, changed position, superflous column at start', function( assert ){

      let res, exp, cand;

      // numeric
      cand = cloneObject( [  testData['1ColDate'][0], testData['2ColMixed'][1], testData['2ColMixed'][0] ] );
      cand.forEach( (col, ind ) => { col.order = ind; } );
      exp  = cloneObject( cand );
      exp = [ exp[2], exp[1], exp[0] ];
      res = reorderCandidate( testData['2ColMixed'], cand );
      assert.deepEqual( res, exp, 'order adjusted' );

    });

  }

});

/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper Function XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

/**
 * simple cloning of a given object
 * @param obj
 * @returns
 */
function cloneObject( obj ) {
  return JSON.parse( JSON.stringify( obj ) );
}