define( [ 'basic/Constants',
          'store/metadata'
], function(
          Constants,
          MetaStore
){

  return function( QUnit ) {

    QUnit.module( 'store/metadata.typeAhead: Validity of results' );

    QUnit.test( 'querying for column headers', async ( assert ) => {

      // async test, so get the callback
      const done = assert.async();

      // datasets
      const input = 'sex';

      try {

        // get metadata
        const res = await MetaStore.typeAhead( input, 10, MetaStore.typeAhead.TYPE_COLUMN );

        // get result keys and values
        const resKeys = Object.keys( res ),
              resValues = Object.values( res );

        // valid values
        const validTypes = [ Constants.DATATYPE.NUMERIC, Constants.DATATYPE.TIME,
                             Constants.DATATYPE.SEMANTIC, Constants.DATATYPE.STRING ];

        // assertions
        assert.equal( typeof res, 'object', 'result has to be an object' );
        resValues
          .forEach( (entry) => {
            assert.ok( 'label' in entry, 'entry has to have a label' );
            assert.ok( validTypes.includes( entry.type ), 'entry type has to be one of the predefined (' + entry.type + ')' );
          });


      } catch(e) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });

  }

});