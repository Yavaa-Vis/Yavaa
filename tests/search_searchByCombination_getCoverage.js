"use strict";
define( [ 'search/searchByCombination/getCoverage',
          'testdata/search_searchByCombination_getCoverage_complex'
], function( getCoverage,
             testdata
){

  return function( QUnit ) {

    QUnit.module( 'search/searchByCombination/getCoverage: Complex tests tests; artificial data' );


    // may be multiple tests, so execute them all
    testdata
      .forEach( (testcase) => {

        QUnit.test( testcase.label, function( assert ){

          // execute the search
          const cov = getCoverage( testcase.query, testcase.candidates ),
                res = new Set( cov.map( (ds) => ds.cand.ds ) ),
                exp = new Set( testcase.result );
          assert.deepEqual( res, exp, 'validate resulting datasetlist' );

        });

      })

  }

});