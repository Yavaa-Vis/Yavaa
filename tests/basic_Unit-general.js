define( [ 'store/unit'], function( UnitStore ){

  return function( QUnit ) {

    QUnit.module( 'basic/types/Unit: General functionality' );

    // cache the units results
    var unitCache = {};
    unitCache[ 'meter' ] =      UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/metre' );
    unitCache[ 'foot' ] =       UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/foot-international' );
    unitCache[ 'squaremeter'] = UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/square_metre' );
    unitCache[ 'newton' ] =     UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/newton' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXX Populate Units XXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'Populate Units', async function( assert ){

      // async test, so get the callback
      var done = assert.async();

      try{

        // request a few units
        var reqs = [];
        reqs.push( unitCache[ 'meter' ] );
        reqs.push( unitCache[ 'squaremeter'] );
        reqs.push( unitCache[ 'newton' ] );

        // populate them
        const res = await UnitStore.populateUnits( reqs );

        // check results
        assert.ok( res[0].isPopulated(), 'Meter - isPopulated()' );
        assert.equal( res[0].getLabel(), 'metre', 'Meter - getLabel()' );
        assert.equal( res[0].getSymbol(), 'm', 'Meter - symbol' );
        assert.deepEqual( res[0].getDimVector(), [1,0,0,0,0,0,0], 'Meter - getDimVector()' );

        assert.ok( res[1].isPopulated(), 'Square Meter - isPopulated()' );
        assert.equal( res[1].getLabel(), 'square metre', 'Square Meter - getLabel()' );
        assert.equal( res[1].getSymbol(), 'm2', 'Meter - symbol' );
        assert.deepEqual( res[1].getDimVector(), [2,0,0,0,0,0,0], 'Square Meter - getDimVector()' );

        assert.ok( res[2].isPopulated(), 'Newton - isPopulated()' );
        assert.equal( res[2].getLabel(), 'newton', 'Newton - getLabel()' );
        assert.equal( res[2].getSymbol(), 'N', 'Meter - symbol' );
        assert.deepEqual( res[2].getDimVector(), [1,1,-2,0,0,0,0], 'Newton - getDimVector()' );

      } catch(e) {

        // internal error
        assert.ok( false, e );

      }

      // finished
      done();

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXX Compare Dimensions XXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'Compare Dimension Vectors', async function( assert ){

      // async test, so get the callback
      var done = assert.async();

      try {

        // request a few units
        var reqs = [];
        reqs.push( unitCache[ 'meter' ] );
        reqs.push( unitCache[ 'foot' ] );
        reqs.push( unitCache[ 'squaremeter'] );
        reqs.push( unitCache[ 'newton' ] );

        // populate units
        const res = await UnitStore.populateUnits( reqs );

        // check results
        assert.ok( res[0].isCompatible( res[1] ),  'Meter == Foot' );
        assert.ok( !res[0].isCompatible( res[2] ), 'Meter != Square-meter' );
        assert.ok( !res[0].isCompatible( res[3] ), 'Meter != Newton' );

      } catch(e) {

        // internal error
        assert.ok( false, e.stack );
      }

      // finish tests
      done();

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Prefixes XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'Prefixes (meter)', async function( assert ){

      // async test, so get the callback
      var done = assert.async();

      try {

        // populate meter
        const unitUsed = (await UnitStore.populateUnits( [ unitCache[ 'meter' ] ] ))[0];

        // get prefixed versions
        const res = await unitUsed.getOtherPrefixes();

        // result should be an array
        assert.ok( res instanceof Array, 'Result is an array' );

        // map all result
        var resMap = {};
        for( var i=0; i<res.length; i++ ) {
          resMap[ res[i].getURI() ] = res[i];
        }

        // some units should be present
        assert.ok( 'http://www.wurvoc.org/vocabularies/om-1.8/metre' in resMap,       'Other prefix for meter returned meter' );
        assert.ok( 'http://www.wurvoc.org/vocabularies/om-1.8/kilometre' in resMap,   'Other prefix for meter returned kilometer' );
        assert.ok( 'http://www.wurvoc.org/vocabularies/om-1.8/millimetre' in resMap,  'Other prefix for meter returned millimeter' );

        // should not contain
        for( var i=0; i<res.length; i++ ) {

          // ... different dimensions
          if( unitUsed.getDimension() !== res[i].getDimension() ) {
            assert.ok( false, 'Contained unit of wrong dimension: ' + res[i].getLabel() );
          }

          // ... something, without "metre" in it
          if( (res[i].getLabel() || '').indexOf( 'metre' ) < 0 ) {
            assert.ok( false, 'Contained unit of wrong base: ' + res[i].getLabel() );
          }

        }

      } catch(e) {

        // internal error
        assert.ok( false, JSON.stringify( e.details ) || e );

      }

      // finished
      done();

    });
  }

});