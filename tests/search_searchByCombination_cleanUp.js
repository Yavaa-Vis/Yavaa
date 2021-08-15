"use strict";
define( [ 'search/searchByCombination/cleanUp'
], function(
          cleanUp
){

  return function( QUnit ) {
    
    QUnit.module( 'search/searchByCombination/createPseudoworkflow/cleanUp: basic tests' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    
    QUnit.test( 'single node; datasets from start of list', function( assert ){
      
      let datasets    = [ 0, 1, 2, 3, 4, 5 ],
          pwf         = { op1: 0, op2: 1, op: 'U' },
          expectedPwf = { op1: 0, op2: 1, op: 'U' },
          expectedDs  = [ 0, 1 ];
      
      // run      
      let res = cleanUp( datasets, pwf ),
          actualPwf = res.pwf,
          actualDs  = res.datasets;
      
      // asserts
      assert.deepEqual( actualDs,  expectedDs,  'dataset list' );
      assert.deepEqual( actualPwf, expectedPwf, 'pseudo workflow' );

    });
    

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    
    QUnit.test( 'single node; datasets from end of list', function( assert ){
      
      let datasets    = [ 0, 1, 2, 3, 4, 5 ],
          pwf         = { op1: 4, op2: 5, op: 'U' },
          expectedPwf = { op1: 0, op2: 1, op: 'U' },
          expectedDs  = [ 4, 5 ];
      
      // run
      let res = cleanUp( datasets, pwf ),
          actualPwf = res.pwf,
          actualDs  = res.datasets;
      
      // asserts
      assert.deepEqual( actualDs,  expectedDs,  'dataset list' );
      assert.deepEqual( actualPwf, expectedPwf, 'pseudo workflow' );

    });

    
    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    
    QUnit.test( 'single node; datasets from arbitrary positions', function( assert ){
      
      let datasets    = [ 0, 1, 2, 3, 4, 5 ],
          pwf         = { op1: 2, op2: 5, op: 'U' },
          expectedPwf = { op1: 0, op2: 1, op: 'U' },
          expectedDs  = [ 2, 5 ];
      
      // run
      let res = cleanUp( datasets, pwf ),
          actualPwf = res.pwf,
          actualDs  = res.datasets;
      
      // asserts
      assert.deepEqual( actualDs,  expectedDs,  'dataset list' );
      assert.deepEqual( actualPwf, expectedPwf, 'pseudo workflow' );

    });
    

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    
    QUnit.test( 'multiple nodes; datasets from arbitrary positions', function( assert ){
      
      let datasets    = [ 0, 1, 2, 3, 4, 5 ],
          pwf         = { op1: { op1: 5, op2: 3, op: 'J' }, op2: 0, op: 'U' },
          expectedPwf = { op1: { op1: 2, op2: 1, op: 'J' }, op2: 0, op: 'U' },
          expectedDs  = [ 0, 3, 5 ];
      
      // run
      let res = cleanUp( datasets, pwf ),
          actualPwf = res.pwf,
          actualDs  = res.datasets;
      
      // asserts
      assert.deepEqual( actualDs,  expectedDs,  'dataset list' );
      assert.deepEqual( actualPwf, expectedPwf, 'pseudo workflow' );

    });
    

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    
    QUnit.test( 'just single dataset', function( assert ){
      
      let datasets    = [ 0, 1, 2, 3, 4, 5 ],
          pwf         = 1,
          expectedPwf = 0,
          expectedDs  = [ 1 ];
      
      // run
      let res = cleanUp( datasets, pwf ),
          actualPwf = res.pwf,
          actualDs  = res.datasets;
      
      // asserts
      assert.deepEqual( actualDs,  expectedDs,  'dataset list' );
      assert.deepEqual( actualPwf, expectedPwf, 'pseudo workflow' );

    });
  }

});