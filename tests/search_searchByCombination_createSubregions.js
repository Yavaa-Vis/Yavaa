"use strict";
/**
 * 
 * in testdata for every column there is an unbound version and a dimension-bound version (d-suffix)
 */
define( [ 'search/searchByCombination/createSubregions',
          'testdata/search_searchByCombination_createSubregions'],
function( createSubregions,
          testData
){

  return function( QUnit ) {

    QUnit.module( 'search/searchByCombination/createSubregions' );

    /*
     * as the function does not modify the columns stored, we can use simpler placeholders here 
     */

    QUnit.test( 'basic tests', function( assert ){

      let region, remainder, res, exp;

      // single remainder per column
      region =      [ testData['A'], testData['B'], testData['C'] ];
      remainder =   [ [testData['0']], [testData['1']], [testData['2']] ];
      res =         createSubregions( region, remainder );
      exp =         new Set( [ [testData['0d'],testData['B'],testData['C']],  [testData['A'], testData['1d'],testData['C']], 
                               [testData['A'], testData['B'],testData['2d']], [testData['0d'],testData['1d'],testData['C']], 
                               [testData['0d'],testData['B'],testData['2d']], [testData['A'], testData['1d'],testData['2d']], 
                               [testData['0'], testData['1'],testData['2']] ] );
      assert.deepEqual( res, exp, 'single remainder per column' );

      // multiple remainders per column
      region =      [ testData['A'], testData['B'], testData['C'] ];
      remainder =   [ [testData['0'],testData['1']], [testData['2']], [testData['3']] ];
      res =         createSubregions( region, remainder );
      exp =         new Set( [ [testData['0d'],testData['B'], testData['C']],  [testData['1d'],testData['B'], testData['C']], 
                               [testData['A'], testData['2d'],testData['C']],  [testData['A'], testData['B'], testData['3d']],
                               [testData['0d'],testData['2d'],testData['C']],  [testData['1d'],testData['2d'],testData['C']], 
                               [testData['0d'],testData['B'], testData['3d']], [testData['1d'],testData['B'], testData['3d']], 
                               [testData['A'], testData['2d'],testData['3d']], 
                               [testData['0'], testData['2'], testData['3']],  [testData['1'], testData['2'], testData['3']] ] );
      assert.deepEqual( res, exp, 'multiple remainders per column' );
      
      // one unmatched column
      region =      [ testData['A'], testData['B'], testData['C'] ];
      remainder =   [ [testData['0']], [testData['1']], [] ];
      res =         createSubregions( region, remainder );
      exp =         new Set( [ [testData['A'], testData['1d'],testData['C']], 
                               [testData['0d'],testData['B'], testData['C']], 
                               [testData['0d'],testData['1d'],testData['C']] ] );
      assert.deepEqual( res, exp, 'no remainder for a column' );
      
      // no remainder for every column
      region =      [ testData['A'], testData['B'], testData['C'] ];
      remainder =   [ [], [], [] ];
      res =         createSubregions( region, remainder );
      exp =         new Set();
      assert.deepEqual( res, exp, 'no remainder for every column' );
      
    });
    
  }

});