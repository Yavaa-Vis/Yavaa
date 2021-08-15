"use strict";
/**
 * rateCandidate
 * params:
 * - region
 * - total dimension count of input dataset (needed for excess)
 * - mapped columns of input dataset
 * - overlap or filters need to be applied
 *
 * the tests are derived from actual input data; usually to track down bugs
 */

define( [ 'search/searchByCombination/rateCandidate',
          'testdata/search_searchByCombination_bug1'],
function( rateCandidate,
          testData
){

  return function( QUnit ) {

    QUnit.module( 'search/searchByCombination/rateCandidate: Simple tests, actual data' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX actual data XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'multiple columns, bug report', function( assert ){

      // rate
      let res = rateCandidate( testData.query, testData.totalDimCount, testData.covers, testData.filter );
      assert.ok( res[0] > 0.999, 'coverage: close to one' );
      assert.equal( res[1], 0.6, 'excess: 3 out of 5 = 0.6')

    });

  }

});