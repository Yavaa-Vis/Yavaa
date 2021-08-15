"use strict";
/**
 * test comm/search.searchByCombination()
 * 
 * store/metadata.*() is mocked
 */
define( [ 'comm/search',
          'util/requirePromise',
          'asserts/deepIncluded',
], function( search,
             requireP
){
  
  return async function( QUnit ) {

    QUnit.module( 'comm/search.searchByCombination: Integration tests; actual data (2)' );

    const testcase = await requireP( 'testdata/comm_search_searchByCombination_1' );
    createTest( testcase );
    
    /** 
     * actual creation of the testcase
     */
    function createTest( testcase ) {
      
      QUnit.test( 'comm/search.searchByCombination: ' + testcase.label, async function( assert ){

        // disabled testcases
        if( ('disabled' in testcase) && testcase.disabled ) {
          assert.ok( false, 'TEST DISABLED - ' + testcase.comment );
          return;
        }

        // async test, so get the callback
        const done = assert.async();

        // mock metastore
        const revertMock = await mockMetastore({
          searchDatasetByConstraint: function mockSearchDatasetByConstraint(){ return testcase.cand },
          getMetadata:  function mockGetMetdata(){ return testcase.metadata },
          getColumns:   function mockGetColumns(){ return testcase.columns },
        });
        
        try {

          // trigger search
          const res = await search.searchByCombination({ constraints: testcase.query });

          // validate result
          assert.yavaa_deepIncluded( testcase.result, res.params, 'every component of the result should be present' );
          assert.yavaa_deepIncluded( res.params, testcase.result, 'no additional components should be present' );

        } catch( e ) {
          // report error
          assert.ok( false, e + "\n" + e.stack );
        } finally {
          // remove all mocks
          revertMock();
        }

        // we are done
        done();

      });
      
    }

  }

  /**
   * crude mocking of some functions im store/metadata
   */
  async function mockMetastore( replacement ) {
    
    // get the metastore
    const metastore = await requireP( 'store/metadata' );
    
    // which functions to replace
    const replaceKeys = Object.keys( replacement );
    
    // replace the functions
    const oldFkt = {};
    replaceKeys.forEach( (key) => {
      
      // keep a link to the original
      oldFkt[ key ] = metastore[ key ];
      
      // set the new one
      metastore[ key ] = replacement[ key ];
      
    });

    // return a revert-function
    return function revert(){
      replaceKeys.forEach( (key) => metastore[ key ] = oldFkt[key] );
    }
    
  }
});