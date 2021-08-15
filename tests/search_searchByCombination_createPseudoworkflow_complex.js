"use strict";
define( [ 'search/searchByCombination/createPseudoworkflow',
          'testdata/search_searchByCombination_createPseudoworkflow_complex',
], function( createPseudoworkflow,
             testdata
){

  return function( QUnit ) {

    QUnit.module( 'search/searchByCombination/createPseudoworkflow: Complex tests; actual data' );


    // may be multiple tests, so execute them all
    testdata
      .forEach( (testcase) => {

        QUnit.test( testcase.label, function( assert ){

          // execute the search
          const res = createPseudoworkflow( testcase.components ),
                exp = testcase.result;

          // is each dataset uri present in the result
          assert.deepEqual( res, exp, 'validate resulting pseudo workflow' );

          // collect used dataset uris
          const usedDs = new Set();
          postOrderWalk( res, (node ) => {
            if( typeof node == 'number' ) {
              usedDs.add( testcase.components[node].ds );
            }
          });

          // collect all provided datasets
          const provDs = new Set();
          testcase.components
            .forEach( c => provDs.add( c.ds ) );

          assert.deepEqual( usedDs, provDs, 'all datasets should be used somewhere' );

        });

      });

  }

  /**
   * helper function to traverse the workflow
   */
  function postOrderWalk( node, cb ) {

    // traverse children
    if( typeof node == 'object' ) {
      if( 'op1' in node){ postOrderWalk( node.op1, cb ); }
      if( 'op2' in node){ postOrderWalk( node.op2, cb ); }
    }

    // execute callback
    cb( node );

  }

});