define( [ 'search/searchByCombination/createPseudoworkflow',
          'testdata/search_searchByCombination_createPseudoworkflow'
], function(
          createPseudoworkflow,
          testdata
){

  return function( QUnit ) {


    QUnit.module( 'search/searchByCombination/createPseudoworkflow' );


    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 2 datasets XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


    QUnit.test( 'Combine two datasets', function( assert ){

      let result, expected;

      // JOIN 1
      result    = createPseudoworkflow( [ testdata.A, testdata.B ] );
      expected  = { op1: 0, op2: 1, op: 'J', cond: [ [ 0, 0 ], [ 1, 1 ] ]  };
      assert.deepEqual( result, expected, 'join 1 (A, B)' );

      // JOIN 2
      result = createPseudoworkflow( [ testdata.E, testdata.A ] );
      expected  = { op1: 0, op2: 1, op: 'J', cond: [ [ 0, 0 ] ] };
      assert.deepEqual( result, expected, 'join 2 (E, A)' );

      // union
      result = createPseudoworkflow( [ testdata.A, testdata.C ] );
      expected  = { op1: 0, op2: 1, op: 'U', cond: [ [ 0, 0 ], [ 1, 1 ], [ 2, 2 ] ] };
      assert.deepEqual( result, expected, 'union (A, C)' );

      // JOIN 3
      result = createPseudoworkflow( [ testdata.A1, testdata.A ] );
      expected  = { op1: 0, op2: 1, op: 'J', cond: [ [ 0, 0 ], [ 1, 1 ] ]  };
      assert.deepEqual( result, expected, 'join 3 (A1, A)' );

      // JOIN 4
      result = createPseudoworkflow( [ testdata.F, testdata.A ] );
      expected  = { op1: 0, op2: 1, op: 'J', cond: [ [ 0, 0 ] ] };
      assert.deepEqual( result, expected, 'join 4 (F, A)' );

      // no match == return first dataset
      result    = createPseudoworkflow( [ testdata.A, testdata.D ] );
      expected  = 0;
      assert.deepEqual( result, expected, 'no match (A, D); return first dataset' );

      // union with column mapping needed
      result    = createPseudoworkflow( [ testdata.A, testdata.A2 ] );
      expected  = { op1: 0, op2: 1, op: 'U', cond: [ [ 0, 1 ], [ 1, 0 ], [ 2, 2 ] ] };
      assert.deepEqual( result, expected, 'union (A, A1)' );

      // join with column mapping needed
      result    = createPseudoworkflow( [ testdata.A, testdata.B1 ] );
      expected  = { op1: 0, op2: 1, op: 'J', cond: [ [ 0, 1 ], [ 1, 0 ] ]  };
      assert.deepEqual( result, expected, 'union (A, B1)' );

    });


    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 3 datasets XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


    QUnit.test( 'Combine three datasets; operation priorities', function( assert ){

      let result, expected;

      // JOIN after UNION
      result    = createPseudoworkflow( [ testdata.G, testdata.H1, testdata.H2 ] );
      expected  = {
                    op1: 0,
                    op2: {
                      op1: 1,
                      op2: 2,
                      op: 'U',
                      cond: [ [ 0, 0 ], [ 1, 1 ] ]
                    },
                    op: 'J',
                    cond: [ [ 0, 0 ] ]
                  };
      assert.deepEqual( result, expected, 'join after union' );

      // UNION after JOIN
      result = createPseudoworkflow( [ testdata.J, testdata.I1, testdata.I2 ] );
      expected  = {
                    op1: 0,
                    op2: {
                      op1: 1,
                      op2: 2,
                      op: 'J',
                      cond: [ [ 0, 0 ] ]
                    },
                    op: 'U',
                    cond: [ [ 0, 0 ], [ 1, 1 ], [ 2, 2 ] ]
                  };
      assert.deepEqual( result, expected, 'union after join' );

    });

    /* XXXXXXXXXXXXXXXXXX datasets including columns to aggregate XXXXXXXXXXXXXXXXX */

    // test currently not needed as input only contains mapped columns
    // so there is no need to take care of aggregations here

//    QUnit.test( 'Combine two datasets; aggregations needed', function( assert ){
//
//      let result, expected;
//
//      // UNION after JOIN
//      result = createPseudoworkflow( [ testdata.J, testdata.I1, testdata.I2_agg ] );
//      expected  = {
//                    op1: 0,
//                    op2: {
//                      op1: 1,
//                      op2: 2,
//                      op: 'J',
//                      cond: [ [ 0, 0 ] ]
//                    },
//                    op: 'U',
//                    cond: [ [ 0, 0 ], [ 1, 1 ], [ 2, 2 ] ]
//                  };
//      assert.deepEqual( result, expected, 'union after join; aggregation needed' );
//
//    });
  }

});