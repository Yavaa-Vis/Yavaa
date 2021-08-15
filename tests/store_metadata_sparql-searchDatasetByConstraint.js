/**
 * test MetaStore.searchDatasetByConstraint
 *
 * requires active triple store
 */
define( [ 'store/metadata.sparql',
          'testdata/store_metadata_sparql-searchDatasetByConstraint',
          'asserts/deepIncluded'
        ],
function( MetaStore,
          testdata
         ){

  return function( QUnit ) {


    QUnit.module( 'store/metadata.sparql: searchDatasetByConstraint' );


    testdata
      .forEach( (testcase) => {

        QUnit.test( testcase.label, async function( assert ){

          // async test, so get the callback
          const done = assert.async();

          try {

            // execute call
            const data = await MetaStore.searchDatasetByConstraint( testcase.query );

            // should return array
            const isArray = data instanceof Array;
            assert.ok( isArray, 'result should be array' );

            // end, if not
            if( !isArray ) {
              return done();
            }

            // do we expect an result?
            if( testcase.result === false ) {

              // no result expected

              // assertion
              assert.equal( data.length, 0, 'result set should be empty' );

            } else {

              // result expected

              // find the result entry
              const entry = data.find( (el) => el.ds == testcase.result.ds );

              // there has to be a matching entry
              assert.ok( entry, 'expected dataset is part of the result' );

              // end, if not
              if( !entry ) {
                return done();
              }

              // compare
              assert.yavaa_deepIncluded( entry, testcase.result, 'actual dataset matches expected dataset' );

            }

          } catch( e ) {
            // report error
            assert.ok( false, e + "\n" + e.stack );
          }

          // finished
          done();

        });

      });

  }

});
