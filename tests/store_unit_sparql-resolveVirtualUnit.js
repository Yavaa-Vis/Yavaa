define( [ 'store/unit.sparql',
          'store/unit/estimateUnit/VirtualUnit',
          'basic/types/ArbNumber'
],function(
          UnitStore ,
          VirtualUnit,
          ArbNumber
){

  return function( QUnit ) {

    // some units used in this tests
    var units = {
      'metre':    UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/metre' ),
      'kilometre':UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/kilometre' ),
      'nanometre':UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/nanometre' ),
      'gram':     UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/gram' ),
      'newton':   UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/newton' ),
      'second':   UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/second-time' ),
      'm/s':      UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/metre_per_second-time' ),
    };

    // some recurring ArbNumbers
    var numbers = {
      '1':      ArbNumber( 1 ),
      '10':     ArbNumber( 10 ),
      '100':    ArbNumber( 100 ),
      '1000':   ArbNumber( 1000 ),
      '10000':  ArbNumber( 10000 ),
      '~nano':  ArbNumber( '0.0000001' ),
      'nano':   ArbNumber( '0.000000001' )
    };


    QUnit.module( 'store/unit.sparql: resolveVirtualUnit' );

    QUnit.test( 'resolve single unit - exact match, no prefix (meter)', function( assert ){

      // async test, so get the callback
      var done = assert.async();

      // create virtual unit
      var vunit = new VirtualUnit({
        num: [ units.metre ],
        denom: [],
        prefixFactor: numbers['1']
      });

      // resolve
      UnitStore.resolveVirtualUnit( vunit )
        .then(function( res ){

          // verify result
          assert.equal( res.unit, units.metre,                  'verify result (metre)' );
          assert.equal( ''+res.factor, ''+numbers['1'],         'verify factor (1)' );
          assert.ok(    !('candidates' in res)
                        || (res.candidates.length == 0),        'no further candidates' );
          assert.ok(    !('vunit' in res),                      'could resolve' );

          done();
        })
        ['catch']( function( e ){
          assert.ok( false, e + "\n" + e.stack );
          done();
        });

    });

    QUnit.test( 'resolve single unit - exact match, prefix > 0 (kilometer)', function( assert ){

      // async test, so get the callback
      var done = assert.async();

      // create virtual unit
      var vunit = new VirtualUnit({
        num: [ units.metre ],
        denom: [],
        prefixFactor: numbers['1000']
      });

      // resolve
      UnitStore.resolveVirtualUnit( vunit )
        .then(function( res ){

          // verify result
          assert.equal( res.unit, units.kilometre,              'verify result (kilometre)' );
          assert.equal( ''+res.factor, ''+numbers['1'],         'verify factor (1)' );
          assert.ok(    !('candidates' in res)
                        || (res.candidates.length == 0),        'no further candidates' );
          assert.ok(    !('vunit' in res),                      'could resolve' );

          done();
        })
        ['catch']( function( e ){
          assert.ok( false, e + "\n" + e.stack );
          done();
        });

    });


    QUnit.test( 'resolve single unit - exact match, prefix < 0 (nanometer)', function( assert ){

      // async test, so get the callback
      var done = assert.async();

      // create virtual unit
      var vunit = new VirtualUnit({
        num: [ units.metre ],
        denom: [],
        prefixFactor: numbers['nano']
      });

      // resolve
      UnitStore.resolveVirtualUnit( vunit )
        .then(function( res ){

          // verify result
          assert.equal( res.unit, units.nanometre,              'verify result (nanometre)' );
          assert.equal( ''+res.factor, ''+numbers['1'],         'verify factor (1)' );
          assert.ok(    !('candidates' in res)
                        || (res.candidates.length == 0),        'no further candidates' );
          assert.ok(    !('vunit' in res),                      'could resolve' );

          done();
        })
        ['catch']( function( e ){
          assert.ok( false, e + "\n" + e.stack );
          done();
        });

    });


    QUnit.test( 'resolve single unit - close match, prefix > 0 (kilometer)', function( assert ){

      // async test, so get the callback
      var done = assert.async();

      // create virtual unit
      var vunit = new VirtualUnit({
        num: [ units.metre ],
        denom: [],
        prefixFactor: numbers['10000']
      });

      // resolve
      UnitStore.resolveVirtualUnit( vunit )
        .then(function( res ){

          // verify result
          assert.equal( res.unit, units.kilometre,              'verify result (kilometre)' );
          assert.equal( ''+res.factor, ''+numbers['10'],        'verify factor (10)' );
          assert.ok(    res.candidates.length > 0,              'other candidates listed' );
          assert.ok(    !('vunit' in res),                      'could resolve' );

          done();
        })
        ['catch']( function( e ){
          assert.ok( false, e + "\n" + e.stack );
          done();
        });

    });


    QUnit.test( 'resolve single unit - close match, prefix > 0 (nanometre)', function( assert ){

      // async test, so get the callback
      var done = assert.async();

      // create virtual unit
      var vunit = new VirtualUnit({
        num: [ units.metre ],
        denom: [],
        prefixFactor: numbers['~nano']
      });

      // resolve
      UnitStore.resolveVirtualUnit( vunit )
        .then(function( res ){

          // verify result
          assert.equal( res.unit, units.nanometre,              'verify result (nanometre)' );
          assert.equal( ''+res.factor, ''+numbers['100'],       'verify factor (100)' );
          assert.ok(    res.candidates.length > 0,              'other candidates listed' );
          assert.ok(    !('vunit' in res),                      'could resolve' );

          done();
        })
        ['catch']( function( e ){
          assert.ok( false, e + "\n" + e.stack );
          done();
        });

    });


    QUnit.test( 'resolve multiple units - exact match, no prefix (metre per second)', function( assert ){

      // async test, so get the callback
      var done = assert.async();

      // create virtual unit
      var vunit = new VirtualUnit({
        num: [ units.metre ],
        denom: [ units.second ],
        prefixFactor: numbers['1']
      });

      // resolve
      UnitStore.resolveVirtualUnit( vunit )
        .then(function( res ){

          // verify result
          assert.equal( res.unit, units['m/s'],                 'verify result (metre per second)' );
          assert.equal( ''+res.factor,''+numbers['1'],          'verify factor (1)' );
          assert.ok(    !('candidates' in res)
                        || (res.candidates.length == 0),        'no further candidates' );
          assert.ok(    !('vunit' in res),                      'could resolve' );

          done();
        })
        ['catch']( function( e ){

          assert.ok( false, e + "\n" + e.stack );
          done();

        });

    });



    QUnit.test( 'resolve complex unit - exact match, no prefix (newton)', function( assert ){

      // async test, so get the callback
      var done = assert.async();

      // create virtual unit
      var vunit = new VirtualUnit({
        num: [ units.metre, units.gram ],
        denom: [ units.second, units.second ],
        prefixFactor: numbers['1000']
      });

      // resolve
      UnitStore.resolveVirtualUnit( vunit )
        .then(function( res ){

          // verify result
          assert.equal( res.unit, units['newton'],              'verify result (metre per second)' );
          assert.equal( ''+res.factor,''+numbers['1'],          'verify factor (1)' );
          assert.ok(    !('candidates' in res)
                        || (res.candidates.length == 0),        'no further candidates' );
          assert.ok(    !('vunit' in res),                      'could resolve' );

          done();
        })
        ['catch']( function( e ){

          assert.ok( false, e + "\n" + e.stack );
          done();

        });

    });
  };

});