define( [ 
  'store/metadata'
], function(
  MetaStore
){

  return function( QUnit ) {

    QUnit.module( 'store/metadata.getColumns: Integration test' );

    QUnit.test( 'get column data for multiple datasets at once', ( assert ) => {

      // async test, so get the callback
      var done = assert.async();

      // datasets
      const input = [
                       'http://yavaa.org/ns/eurostat/dsd#teilm010',
                       'http://yavaa.org/ns/eurostat/dsd#teilm011'
                     ];

      MetaStore
        .getColumns( input )
        .then( (res) => {

          // there should be an entry for each input dataset
          input.forEach( (key) => {
            assert.ok( key in res, 'dataset is present: ' + key );
          });

          done();

        });

    });

    QUnit.test( 'get columns for a single dataset', ( assert ) => {

      // async test, so get the callback
      var done = assert.async();

      // datasets
      const input = 'http://yavaa.org/ns/eurostat/dsd#teilm010';

      MetaStore
        .getMetadata( input )
        .then( (res) => {

          // structure should be flat, so the input should not appear as key
          assert.notOk( input in res, 'there should be no key for the dataset id' );

          done();

        });

    });

  }

});