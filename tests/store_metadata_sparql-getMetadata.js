define( [ 
          'store/metadata'
], function(
          MetaStore
){

  return function( QUnit ) {

    QUnit.module( 'store/metadata.getMetadata: Integration test' );

    QUnit.test( 'get metadata for multiple datasets at once', async ( assert ) => {

      // async test, so get the callback
      const done = assert.async();

      // datasets
      const input = [
                       'http://yavaa.org/ns/eurostat/dsd#teilm010',
                       'http://yavaa.org/ns/eurostat/dsd#teilm011'
                     ];

      try {

        // get metadata
        const res = await MetaStore.getMetadata( input );

        // there should be an entry for each input dataset
        input.forEach( (key) => {
          assert.ok( key in res, 'dataset is present: ' + key );
        });

      } catch(e) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });


    QUnit.test( 'get metadata for a single dataset', async ( assert ) => {

      // async test, so get the callback
      const done = assert.async();

      // datasets
      const input = 'http://yavaa.org/ns/eurostat/dsd#teilm010';

      try {

        // get metadata
        const res = await MetaStore.getMetadata( input );

        // structure should be flat, so the input should not appear as key
        assert.notOk( input in res, 'there should be no key for the dataset id' );

      } catch(e) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });

  }

});