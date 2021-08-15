"use strict";
/**
 * test the results of codelist value retrieval
 * 
 * ==== NOTE ====
 * 
 * actual codelists in the store might vary depending on the eurostat builder, 
 * so make sure to update them, when running the builder anew
 * 
 */
define( [ 'store/metadata'
], function(
          MetaStore
){

  return function( QUnit ) {

    QUnit.module( 'store/metadata.sparql.getCodelistValues: Integration test' );

    QUnit.test( 'Single codelist', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      // input data
      const input   = 'http://yavaa.org/ns/cl/eurostat#sex_3',
      
      // expected output
            prefix  = 'http://eurostat.linked-statistics.org/dic/sex#';


      // get code lists' values
      const d = await MetaStore.getCodelistValues( input );

      // we need some result
      assert.deepEqual( Object.keys( d ), [ input ], 'there should just be an entry for our input' );
      
      if( input in d ) {

        // check values in codelist
        const nonConformingPrefixes = d[ input ].filter( (uri) => uri.indexOf( prefix ) != 0 );
        
        // assertions
        assert.deepEqual( nonConformingPrefixes, [], 'all values should have the same prefix' );
        
      }

      done();

    });


    QUnit.test( 'Mulitple codelists', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      // input data
      const input = [
                      'http://yavaa.org/ns/cl/eurostat#sex_3',
                      'http://yavaa.org/ns/cl/eurostat#geo_1'
                    ].sort(),


      // expected output
          prefix  = {
                      'http://yavaa.org/ns/cl/eurostat#sex_3': 'http://eurostat.linked-statistics.org/dic/sex#',
                      'http://yavaa.org/ns/cl/eurostat#geo_1': 'http://eurostat.linked-statistics.org/dic/geo#',
                    };

      
      // get code lists' values
      const d = await MetaStore.getCodelistValues( input );
      
      // we need some result
      assert.deepEqual( Object.keys( d ).sort(), input, 'there should be an entry for each input' );

      // checks
      const nonConformingPrefixes = [];
      for( let key of input ) {
        if( key in d ) {
          nonConformingPrefixes.push( ... d[ key ].filter( (uri) => uri.indexOf( prefix[key] ) != 0 ) );
        }
      }
      
      // assertions
      assert.deepEqual( nonConformingPrefixes, [], 'all values from one input should have the same prefix' );

      done();

    });

  }

});