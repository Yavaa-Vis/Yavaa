define( [ 'search/searchByCombination/createPseudoworkflow/classifyCombination',
          'testdata/search_searchByCombination_createPseudoworkflow'
], function(
          classifyCombination,
          testdata
){

  return function( QUnit ) {

    QUnit.module( 'search/searchByCombination/createPseudoworkflow/classifyCombination' );

    QUnit.test( 'Classify combination of two datasets', function( assert ){

      let result, exp;

      // JOIN 1
      result = classifyCombination( testdata.A, testdata.B );
      exp    = { type: 'J', weight: 1, cond: [ [ 0, 0 ], [ 1, 1 ] ] };
      assert.deepEqual( result, exp, 'join 1 (A, B)' );

      // JOIN 2
      result = classifyCombination( testdata.E, testdata.A );
      exp    = { type: 'J', weight: 2, cond: [ [ 0, 0 ] ] };
      assert.deepEqual( result, exp , 'join 2 (E, A)' );

      // union
      result = classifyCombination( testdata.A, testdata.C );
      exp    = { type: 'U', weight: 3, cond: [ [ 0, 0 ], [ 1, 1 ], [ 2, 2 ] ] };
      assert.deepEqual( result, exp, 'union (A, C)' );

      // JOIN 3
      result = classifyCombination( testdata.A1, testdata.A );
      exp    = { type: 'J', weight: 4, cond: [ [ 0, 0 ], [ 1, 1 ] ] };
      assert.deepEqual( result, exp, 'join 3 (A1, A)' );

      // JOIN 4
      result = classifyCombination( testdata.F, testdata.A );
      exp    = { type: 'J', weight: 5, cond: [ [ 0, 0 ] ] };
      assert.deepEqual( result, exp, 'join 4 (F, A)' );

      // no match
      result = classifyCombination( testdata.A, testdata.D );
      exp    = { type: 'D', weight: Number.MAX_VALUE };
      assert.deepEqual( result, exp, 'no match (A, D)' );

      // no match 2
      result = classifyCombination( testdata.I1, testdata.J );
      exp    = { type: 'D', weight: Number.MAX_VALUE };
      assert.deepEqual( result, exp, 'no match (I1, J)' );

      // union with column mapping needed
      result = classifyCombination( testdata.A, testdata.A2 );
      exp    = { type: 'U', weight: 3, cond: [ [ 0, 1 ], [ 1, 0 ], [ 2, 2 ] ] };
      assert.deepEqual( result, exp, 'union (A, A1)' );

      // join with column mapping needed
      result = classifyCombination( testdata.A, testdata.B1 );
      exp    = { type: 'J', weight: 1, cond: [ [ 0, 1 ], [ 1, 0 ] ] };
      assert.deepEqual( result, exp, 'join (A, B1)' );

    });

  }

});