"use strict";

define( [ 'search/searchByCombination/getIntersection',
          'basic/Constants',
          'testdata/search_searchByCombination'],
function( getIntersection,
          Constants,
          testData
){

  return function( QUnit ) {

    QUnit.module( 'search/searchByCombination/getIntersection' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXX Exact match; single column XXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'exact match; single column', function( assert ){

      let res, exp;

      // numeric
      res = getIntersection( testData['1ColNumeric_0to10'], testData['1ColNumeric_0to10'] );
      exp = {
          remainder: [ [] ],
          filter:    [{
            minValue:   0,
            maxValue:   10,
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column' );

      // date
      res = getIntersection( testData['1ColDate'], testData['1ColDate'] );
      exp = {
          remainder: [ [] ],
          filter:    [{
            minValue:   new Date( 2010, 1, 1 ),
            maxValue:   new Date( 2010, 1, 11 ),
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'date column' );

      // enum
      res = getIntersection( testData['1ColEnum'], testData['1ColEnum'] );
      exp = {
          remainder: [ [] ],
          filter:    [{
            values:     [ 'A', 'B', 'C', 'D' ],
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'enum column' );

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXX Exact match; single column as subset XXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'exact match; single column as subset', function( assert ){

      let res, exp;

      // numeric
      res = getIntersection( testData['2ColMixed'], testData['1ColNumeric_0to10'] );
      exp = {
          remainder: [ [], testData['2ColMixed'][1] ],
          filter:    [ {
            minValue:   0,
            maxValue:   10,
            effective:  false,
            order:      0
          }, null ]
      };
      assert.deepEqual( res, exp, 'single column as subset, exact match' );

    });


    /* XXXXXXXXXXXXXXXXXXXXXXXXXX Partial match; single column XXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'partial match; single column', function( assert ){

      let res, exp;

      // numeric
      res = getIntersection( testData['1ColNumeric_0to10'], testData['1ColNumeric_0to5'] );
      exp = {
          remainder: [ testData['1ColNumeric_5to10'] ],
          filter:    [{
            minValue:   0,
            maxValue:   5,
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column - subrange, 1 remainder' );

      res = getIntersection( testData['1ColNumeric_0to10'], testData['1ColNumeric_3to8'] );
      exp = {
          remainder: [ [ testData['1ColNumeric_0to3'][0], testData['1ColNumeric_8to10'][0] ] ],
          filter:    [{
            minValue:   3,
            maxValue:   8,
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column - subrange, 2 remainders' );

      res = getIntersection( testData['1ColNumeric_0to10'], testData['1ColNumeric_-5to5'] );
      exp = [ testData['1ColNumeric_5to10'] ];
      exp = {
          remainder: [ testData['1ColNumeric_5to10'] ],
          filter:    [{
            minValue:   0,
            maxValue:   5,
            effective:  true,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column - lower overlap' );

      res = getIntersection( testData['1ColNumeric_0to10'], testData['1ColNumeric_5to20'] );
      exp = {
          remainder: [ testData['1ColNumeric_0to5'] ],
          filter:    [{
            minValue:   5,
            maxValue:   10,
            effective:  true,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column - upper overlap' );

      // date
      res = getIntersection( testData['1ColDate'], testData['1ColDate_partA'] );
      exp = {
          remainder: [ testData['1ColDate_partB'] ],
          filter:    [{
            minValue:   new Date( 2010, 1, 1 ),
            maxValue:   new Date( 2010, 1, 6 ),
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res,  exp, 'date column - subrange' );

      // enumeration
      res = getIntersection( testData['1ColEnum'], testData['1ColEnum_partA'] );
      exp = {
          remainder: [ testData['1ColEnum_partB'] ],
          filter:    [{
            values:     [ 'C', 'D' ],
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'enum column' );

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXX Partial match; single column; region open ended XXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'partial match; single column; region open ended', function( assert ){

      let res, exp;

      // numeric
      res = getIntersection( testData['1ColNumeric_to10'], testData['1ColNumeric_0to10'] );
      exp = {
          remainder: [ testData['1ColNumeric_to0'] ],
          filter:    [{
            minValue:   0,
            maxValue:   10,
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column - no mininum' );

      res = getIntersection( testData['1ColNumeric_from0'], testData['1ColNumeric_0to10'] );
      exp = {
          remainder: [ testData['1ColNumeric_from10'] ],
          filter:    [{
            minValue:   0,
            maxValue:   10,
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column - no mininum' );

      res = getIntersection( testData['1ColNumeric_open'], testData['1ColNumeric_0to10'] );
      exp = [  ];
      exp = {
          remainder: [ [ testData['1ColNumeric_to0'][0], testData['1ColNumeric_from10'][0] ] ],
          filter:    [{
            minValue:   0,
            maxValue:   10,
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column - no mininum and maximum' );
    });


    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX No match; single column XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'no match; single column', function( assert ){

      let res, exp;

      // numeric
      res = getIntersection( testData['1ColNumeric_0to5'], testData['1ColNumeric_5to10'] );
      exp = {
          remainder: [ testData['1ColNumeric_0to5'] ],
          filter:    [{
            minValue:   5,
            maxValue:   5,
            effective:  true,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column; shared border' );

      res = getIntersection( testData['1ColNumeric_0to3'], testData['1ColNumeric_5to10'] );
      exp = {
          remainder: [ testData['1ColNumeric_0to3'] ],
          filter:    [{
            minValue:   5,
            maxValue:   5,
            effective:  true,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'numeric column; no shared border' );

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXX Open Ended Query; single column XXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'open ended query; single column', function( assert ){

      let res, exp;

      // numeric
      res = getIntersection( [{
              "datatype":   Constants.DATATYPE.NUMERIC,
              "colEnums":   null
            }], testData['1ColNumeric_0to10'] );
      exp = {
          remainder: [ [{
            datatype: Constants.DATATYPE.NUMERIC,
            maxValue: 0,
            colEnums: null,
          }, {
            datatype: Constants.DATATYPE.NUMERIC,
            minValue: 10,
            colEnums: null,
          }] ],
          filter:    [{ 
            minValue: 0, 
            maxValue: 10, 
            order: 0, 
            effective: false 
          }]
      };
      assert.deepEqual( res, exp, 'numeric column' );

      // time
      res = getIntersection( [{
              "datatype":   Constants.DATATYPE.TIME,
              "colEnums":   null
            }], testData['1ColDate'] );
      exp = {
          remainder: [ [{
            datatype: Constants.DATATYPE.TIME,
            maxValue: new Date( 2010, 1, 1 ),
            colEnums: null,
          }, {
            datatype: Constants.DATATYPE.TIME,
            minValue: new Date( 2010, 1, 11 ),
            colEnums: null,
          }] ],
          filter:    [{ 
            minValue: new Date( 2010, 1, 1 ), 
            maxValue: new Date( 2010, 1, 11 ), 
            order: 0, 
            effective: false 
          }]
      };
      assert.deepEqual( res, exp, 'time column' );

      // enum
      res = getIntersection( [{
              "datatype":   Constants.DATATYPE.SEMANTIC,
              "colEnums":   []
            }], testData['1ColEnum'] );
      exp = {
          remainder: [ [{
            datatype: Constants.DATATYPE.SEMANTIC,
            colEnums: [ 'A', 'B', 'C', 'D' ],
            negate:   true,
          }] ],
          filter:    [{
            values:     [ 'A', 'B', 'C', 'D' ],
            effective:  false,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'enum column' );

      // enum - negated query
      res = getIntersection( [{
              "datatype":   Constants.DATATYPE.SEMANTIC,
              "colEnums":   [ 'A', 'B' ],
              "negate":     true,
            }], testData['1ColEnum'] );
      exp = {
          remainder: [ [{
            datatype: Constants.DATATYPE.SEMANTIC,
            colEnums: [ 'A', 'B', 'C', 'D' ],
            negate:   true,
          }] ],
          filter:    [{
            values:     [ 'C', 'D' ],
            effective:  true,
            order:      0
          }]
      };
      assert.deepEqual( res, exp, 'enum column' );

    });

  }

});