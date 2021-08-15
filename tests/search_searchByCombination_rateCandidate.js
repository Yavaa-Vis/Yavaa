"use strict";
/**
 * rateCandidate
 * params:
 * - region
 * - total dimension count of input dataset (needed for excess)
 * - mapped columns of input dataset
 * - overlap or filters need to be applied
 *
 * overlap is mocked by objects with the necessary properties
 */

define( [ 'search/searchByCombination/rateCandidate',
          'basic/Constants',
          'testdata/search_searchByCombination',
          'testdata/search_searchByCombination_bug1'
], function( rateCandidate,
             Constants,
             testData,
             testData_bug1
){

  return function( QUnit ) {

    /* ------------------------------------ unbound tests ---------------------------------------- */

    QUnit.module( 'search/searchByCombination/rateCandidate: Simple tests, artificial data, all columns unbound' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX single column, exact match XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // note: excess (2nd value) can not be measured in this single measure testcases
    // so all results will have NaN instead

    QUnit.test( 'single column, exact match', function( assert ){

      let res, overlap;

      // numeric
      overlap = [ { minValue: 0, maxValue: 10 } ];
      res = rateCandidate( testData['1ColNumeric_0to10'], 1, testData['1ColNumeric_0to10'], overlap );
      assert.deepEqual( res, [1, 1], 'numeric column' );

      // date
      overlap = [ { minValue: new Date( 2010, 1, 1 ), maxValue: new Date( 2010, 1, 11 ) } ];
      res = rateCandidate( testData['1ColDate'], 1, testData['1ColDate'], overlap );
      assert.deepEqual( res, [1, 1], 'date column' );

      // enum
      overlap = [ { values: [ 'A', 'B', 'C', 'D' ] } ];
      res = rateCandidate( testData['1ColEnum'], 1, testData['1ColEnum'], overlap );
      assert.deepEqual( res, [1, 1], 'enum column' );

    });


    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX single column, partial match XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'single column, partial match', function( assert ){

      let res, overlap;

      // numeric
      overlap = testData['1ColNumeric_5to10'];
      res = rateCandidate( testData['1ColNumeric_0to10'], 1, testData['1ColNumeric_5to10'], overlap );
      assert.deepEqual( res, [0.5, 1], 'numeric column' );

      // date
      overlap = testData['1ColDate_partB'];
      res = rateCandidate( testData['1ColDate'], 1, testData['1ColDate_partB'], overlap );
      assert.deepEqual( res, [0.5, 1], 'date column' );

      // enum
      overlap = [ { values: testData['1ColEnum_partB'][0].colEnums } ];
      res = rateCandidate( testData['1ColEnum'], 1, testData['1ColEnum_partB'], overlap );
      assert.deepEqual( res, [0.5, 1], 'enum column' );

      // open ended
      overlap = [ { minValue: 0, maxValue: 10 } ];
      res = rateCandidate( testData['1ColNumeric_to10'], 1, testData['1ColNumeric_0to10'], overlap );
      assert.deepEqual( res, [0.9, 1], 'numeric column - no minimum in region, overlap, same borders' );

      overlap = [ { minValue: 0, maxValue: 5 } ];
      res = rateCandidate( testData['1ColNumeric_to10'], 1, testData['1ColNumeric_0to5'], overlap );
      assert.deepEqual( res, [0.8, 1], 'numeric column - no minimum in region, overlap, different borders' );

      overlap = [ { minValue: 0, maxValue: 10 } ];
      res = rateCandidate( testData['1ColNumeric_from0'], 1, testData['1ColNumeric_0to10'], overlap );
      assert.deepEqual( res, [0.9, 1], 'numeric column - no maximum in region, overlap, same borders' );

      overlap = [ { minValue: 0, maxValue: 10 } ];
      res = rateCandidate( testData['1ColNumeric_open'], 1, testData['1ColNumeric_0to10'], overlap );
      assert.deepEqual( res, [0.9, 1], 'numeric column - no minimum and maximum in region' );

      overlap = [ { minValue: 10, maxValue: 10 } ];
      res = rateCandidate( testData['1ColNumeric_to10'], 1, testData['1ColNumeric_10to20'], overlap );
      assert.deepEqual( res, [0, 1], 'numeric column - no minimum in region, no overlap, same borders' );

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX multiple columns, exact match XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'multiple columns, exact on subset of columns', function( assert ){

      let res, mapped, overlap;

      // numeric
      mapped    = [ testData['2ColMixed_NumericDim'][0], null, testData['2ColMixed_NumericDim'][1], null ];
      overlap = [ testData['4ColMixed'][0], null, testData['4ColMixed'][2], null ];
      res = rateCandidate( testData['4ColMixed'], 1, mapped, overlap );
      assert.deepEqual( res, [ 0.5, 1 ], 'numeric dim, numeric meas' );

      // enum
      mapped  = [ null, testData['2ColMixed_EnumDim'][0], testData['2ColMixed_EnumDim'][1], null ];
      overlap = [ null, { values: testData['2ColMixed_EnumDim'][0].colEnums }, testData['2ColMixed_EnumDim'][1], null ];
      res = rateCandidate( testData['4ColMixed'], 1, mapped, overlap );
      assert.deepEqual( res, [ 0.5, 1 ], 'enum dim, numeric meas' );

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX single column, enum - negated region XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'single column, enum - negated region', function( assert ){

      let res, overlap, query;

      // enum; partial match; region is negated
      query = [{
        "datatype":   Constants.DATATYPE.SEMANTIC,
        "colEnums":   [ 'A', 'B' ],
        "negate":     true,
      }],
      overlap = [{
        values:     [ 'C', 'D' ],
        effective:  true,
        order:      0
      }];
      res = rateCandidate( query, 1, testData['1ColEnum'], overlap );
      assert.deepEqual( res, [ 1 - 1/3, 1], 'enum; partial match; region is negated' );

    });

    /* ------------------------------------- bound tests ----------------------------------------- */

    QUnit.module( 'search/searchByCombination/rateCandidate: Simple tests, artificial data, some columns bound' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX single column, exact match XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'single column, exact match, type mismatch', function( assert ){

      let res, overlap;

      // numeric; region is dimension, cand is measurement
      overlap = [ { minValue: 0, maxValue: 10 } ];
      res = rateCandidate( testData['1ColNumeric_0to10'], 0, testData['1ColNumeric_0to10m'], overlap );
      assert.deepEqual( res, [0, 0], 'numeric; region is dimension, cand is measurement' );

    });

  }

});