define( [ 'store/unit.sparql',
          'basic/types/ArbNumber',
          'comp/function/parseFormula/Constants',
          'asserts/astEqual'
        ],
function( UnitStore,
          ArbNumber,
          parseFormulaConst
         ){

  return function( QUnit ) {

    // cache the units results
    var unitCache = {};
    unitCache[ 'metre' ]      = UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/metre' );
    unitCache[ 'centimetre' ] = UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/centimetre' );
    unitCache[ 'inch' ]       = UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/inch-international' );
    unitCache[ 'celsius' ]    = UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/degree_Celsius' );
    unitCache[ 'fahrenheit' ] = UnitStore.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/degree_Fahrenheit' );

    // cache ArbNumber values
    var numberCache = {};
    numberCache[ '0' ]    = ArbNumber( '0' );
    numberCache[ '1' ]    = ArbNumber( '1' );
    numberCache[ '100' ]  = ArbNumber( '100' );
    numberCache[ '1000' ] = ArbNumber( '1000' );

    QUnit.module( 'store/unit.sparql: conversion' );


    QUnit.test( 'Just prefix (centimetre -> metre)', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      try {

        // populate units
        const [ uCentimeter, uMeter ] = await UnitStore.populateUnits( [ unitCache['centimetre'], unitCache['metre'] ] );

        // request conversion function from meter to centimeter
        convFunction = await UnitStore.convertUnits( uCentimeter, uMeter );

        // check type
        assert.ok( convFunction instanceof Function, 'return type' );
        assert.equal( typeof convFunction, 'function', 'return type' );

        // check some values
        assert.equal( convFunction( { value: numberCache['0'] } ),    '0',  'zero should still be zero' );
        assert.equal( convFunction( { value: numberCache['100'] } ),  '1',  '100cm = 1m' );
        assert.equal( convFunction( { value: numberCache['1000'] } ), '10', '1000cm = 10m' );

      } catch( e ) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });


    QUnit.test( 'Between different systems (inch -> metre)', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      try {

        // populate units
        const [ uMetre, uInch ] = await UnitStore.populateUnits( [ unitCache['metre'], unitCache['inch'] ] );

        // request conversion function from meter to centimeter
        convFunction = await UnitStore.convertUnits( uInch, uMetre );

        // check type
        assert.ok( convFunction instanceof Function, 'return type' );
        assert.equal( typeof convFunction, 'function', 'return type' );

        // check some values
        assert.equal( convFunction( { value: numberCache['0'] } ), '0',      '0in = 0m' );
        assert.equal( convFunction( { value: numberCache['1'] } ), '0.0254', '1in = 0.0254m' );

      } catch( e ) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });


    QUnit.test( 'Between different systems (metre -> inch)', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      try {

        // populate units
        const [ uMetre, uInch ] = await UnitStore.populateUnits( [ unitCache['metre'], unitCache['inch'] ] );

        // request conversion function from meter to centimeter
        convAST = await UnitStore.convertUnits( uMetre, uInch, parseFormulaConst.OUT_AST );

        // check the AST
        assert.yavaa_astEqual( convAST,
                               {"type":1,"value":"/","children":[{"type":2,"value":"value"},{"type":0,"value":"2.54e-2"}]},
                               "check AST" );

      } catch( e ) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });


    QUnit.test( 'Between different systems and prefix (inch -> centimetre)', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      try {

        // populate units
        const [ uCentimetre, uInch ] = await UnitStore.populateUnits( [ unitCache['centimetre'], unitCache['inch'] ] );

        // request conversion function from meter to centimeter
        convFunction = await UnitStore.convertUnits( uInch, uCentimetre );

        // check type
        assert.ok( convFunction instanceof Function, 'return type' );
        assert.equal( typeof convFunction, 'function', 'return type' );

        // check some values
        assert.equal( convFunction( { value: numberCache['0'] } ), '0',      '0in = 0cm' );
        assert.equal( convFunction( { value: numberCache['1'] } ), '2.54',   '1in = 2.54cm' );

      } catch( e ) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });


    QUnit.test( 'Involving Scales (degree Celsius -> degree Fahrenheit)', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      try {

        // populate units
        const [ uCelsius, uFahrenheit ] = await UnitStore.populateUnits( [ unitCache['celsius'], unitCache['fahrenheit'] ] );

        // request conversion function from meter to centimeter
        convFunction = await UnitStore.convertUnits( uCelsius, uFahrenheit );

        // check type
        assert.ok( convFunction instanceof Function, 'return type' );
        assert.equal( typeof convFunction, 'function', 'return type' );

        // check some values
        assert.equal( convFunction( { value: numberCache['0'] } ),    '32', '  0°C =  32°F' );
        assert.equal( convFunction( { value: numberCache['100'] } ), '212', '100°C = 212°F' );

      } catch( e ) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });


    QUnit.test( 'Involving Scales (degree Fahrenheit -> degree Celsius)', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      try {

        // populate units
        const [ uCelsius, uFahrenheit ] = await UnitStore.populateUnits( [ unitCache['celsius'], unitCache['fahrenheit'] ] );

        // request conversion function from meter to centimeter
        convAST = await UnitStore.convertUnits( uFahrenheit, uCelsius, parseFormulaConst.OUT_AST );

        // check the AST
        assert.yavaa_astEqual( convAST,
                               {"type":1,"value":"+","children":[{"type":1,"value":"/","children":[{"type":1,"value":"-","children":[{"type":2,"value":"value"},{"type":0,"value":"-459.67"}]},{"type":0,"value":"1.8"}]},{"type":0,"value":"-273.15"}]},
                               "check AST" );

      } catch( e ) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });


    QUnit.test( 'Single inverse scaled unit (denominator) ( 1 / °F -> 1 / °C )', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      try {

        // populate units
        const [ uCelsius, uFahrenheit ] = await UnitStore.populateCompounds( [ unitCache['celsius'], unitCache['fahrenheit'] ] );

        // request conversion function from meter to centimeter
        convAST = await UnitStore.convertUnits( uFahrenheit, uCelsius, parseFormulaConst.OUT_AST, true );

        // check the AST
        assert.yavaa_astEqual( convAST,
                               {"type":1,"value":"/","children":[{"type":0,"value":"1"},{"type":1,"value":"+","children":[{"type":1,"value":"/","children":[{"type":1,"value":"-","children":[{"type":2,"value":"value"},{"type":0,"value":"-459.67"}]},{"type":0,"value":"1.8"}]},{"type":0,"value":"-273.15"}]}]},
                               "check AST" );

      } catch( e ) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });


    QUnit.test( 'Invalid conversion ( m -> °C)', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      try {

        // populate units
        const [ uCelsius, uMeter ] = await UnitStore.populateCompounds( [ unitCache['celsius'], unitCache['metre'] ] );

        try {

          // request conversion function from meter to centimeter
          const convAST = await UnitStore.convertUnits( uMeter, uCelsius, parseFormulaConst.OUT_AST, true );

          // assert
          assert.ok( false, 'should fail' );
          
        } catch( e ) {

          // assert
          assert.equal( e.message, 
                        'Can not convert from <http://www.wurvoc.org/vocabularies/om-1.8/metre> to <http://www.wurvoc.org/vocabularies/om-1.8/degree_Celsius>!',
                        'should fail with suitable message' );

        }

      } catch( e ) {

        // internal error
        assert.ok( false, e + "\n" + e.stack );

      }

      // finished
      done();

    });

  };

});