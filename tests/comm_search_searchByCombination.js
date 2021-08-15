"use strict";
define( [ 'comm/search',
          'testdata/comm_search_searchByCombination',
          'asserts/deepIncluded'
], function( search,
             testdata
){

  return function( QUnit ) {

    QUnit.module( 'comm/search.searchByCombination: Integration tests; actual data' );

    // may be multiple tests, so execute them all
    testdata
      .forEach( (testcase) => {

        QUnit.test( 'comm/search.searchByCombination: ' + testcase.label, async function( assert ){

          // disabled testcases
          if( ('executable' in testcase) && (testcase.executable === false) ) {
            assert.expect( 0 );
            return;
          }

          // async test, so get the callback
          const done = assert.async();

          try {

            // trigger search
            const res = await search.searchByCombination({ constraints: testcase.query });

            // validate result
            if( testcase.result === false ) {
              assert.equal( res.params.components.length, 0, 'should have no components' );
            } else {
              assert.yavaa_deepIncluded( res.params.components, testcase.result, 'validate components' );
            }

            // no duplicates in components
            if( testcase.uniqueComponents ) {
              assert.equal( res.params.components.length,
                  (new Set( res.params.components.map( c => c.ds ) )).size,
                  'no duplicates in components' );
            }

            // components and pwf are consistent
            // == no element in components, that is not used in pwf
            const usedDs    = [ ... new Set( getUsedDs( res.params.pwf ) ) ].sort(),
                  listedDs  = res.params.components.map( (el,i) => i );
            assert.deepEqual( usedDs, listedDs, 'all components should be used in the pseudo-workflow' );

          } catch( e ) {
            // report error
            assert.ok( false, e + "\n" + e.stack );
          }

          // we are done
          done();

        });

      });

  }
  
  /**
   * extract used dataset index numbers from pseudo-workflow
   * @param pwf
   * @returns
   */
  function getUsedDs( pwf ) {
    if( typeof pwf == 'number' ) {
      return [ pwf ];
    } else if( ('op1' in pwf) && ('op2' in pwf)){
      return [ ... getUsedDs( pwf.op1 ), ... getUsedDs( pwf.op2 ) ]
    } else {
      return [];
    }
  }

});