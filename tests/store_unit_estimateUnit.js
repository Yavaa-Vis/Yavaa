"use strict";
define( [ 
          'store/unit',
          'comp/function/parseFormula',
          'comp/function/parseFormula/Constants',
          'store/unit/estimateUnit',
          'asserts/astEqual'
        ],
function( 
          UnitStore,
          parseFormula,
          parseConstants,
          estimateUnit
         ){

  return function( QUnit ) {

    QUnit.module( 'store/unit/estimateUnit: resulting units' );
    
    /* --------------------------------------------------------------------- */
    
    createTest({
      name:     'flat units / no sorting: [m] + [in]',
      formula:  'col1 + col2',
      binding: {
        col1: 'metre',
        col2: 'inch-international'
      },
      resultCount: 2,
      results: [{
        unit: 'metre',
        ast:  {"value":"+","type":1,"children":[{"value":"col1","type":2,"children":[]},{"type":1,"value":"*","children":[{"value":"col2","type":2,"children":[]},{"type":0,"value":"2.54e-2"}]}]},
        conv: 1
      },{
        unit: 'inch-international',
        ast:   {"value":"+","type":1,"children":[{"type":1,"value":"/","children":[{"value":"col1","type":2,"children":[]},{"type":0,"value":"2.54e-2"}]},{"value":"col2","type":2,"children":[]}]},
        conv: 1
      }],
      addResults: [{
        unit: 'foot-international',
        ast:  {"type":1,"value":"/","children":[{"value":"+","type":1,"children":[{"value":"col1","type":2,"children":[]},{"type":1,"value":"*","children":[{"value":"col2","type":2,"children":[]},{"type":0,"value":"2.54e-2"}]}]},{"type":0,"value":"3.048e-1"}]},
      }]
    });
    
    createTest({
      name:     'flat units / sorting: [m] + [in] + [m] + [in] + [m]',
      formula:  'col1 + col2 + col1 + col2 + col1',
      binding: {
        col1: 'metre',
        col2: 'inch-international'
      },
      resultCount: 2,
      results: [{
        unit: 'metre',
        ast:  {"value":"+","type":1,"children":[{"type":1,"value":"*","children":[{"value":"+","type":1,"children":[{"value":"col2","type":2,"children":[]},{"value":"col2","type":2,"children":[]}]},{"type":0,"value":"2.54e-2"}]},{"value":"+","type":1,"children":[{"value":"+","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col1","type":2,"children":[]}]},{"value":"col1","type":2,"children":[]}]}]},
        conv: 1
      },{
        unit: 'inch-international',
        ast:   {"value":"+","type":1,"children":[{"type":1,"value":"/","children":[{"value":"+","type":1,"children":[{"value":"+","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col1","type":2,"children":[]}]},{"value":"col1","type":2,"children":[]}]},{"type":0,"value":"2.54e-2"}]},{"value":"+","type":1,"children":[{"value":"col2","type":2,"children":[]},{"value":"col2","type":2,"children":[]}]}]},
        conv: 1
      }],
      addResults: [{
        unit: 'foot-international',
        ast:  {"type":1,"value":"/","children":[{"value":"+","type":1,"children":[{"type":1,"value":"*","children":[{"value":"+","type":1,"children":[{"value":"col2","type":2,"children":[]},{"value":"col2","type":2,"children":[]}]},{"type":0,"value":"2.54e-2"}]},{"value":"+","type":1,"children":[{"value":"+","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col1","type":2,"children":[]}]},{"value":"col1","type":2,"children":[]}]}]},{"type":0,"value":"3.048e-1"}]},
      }]
    });
    
    createTest({
      name:     'compound units / resolving: [m] / [s]',
      formula:  'col1 / col2',
      binding: {
        col1: 'metre',
        col2: 'second-time'
      },
      resultCount: 1,
      results: [{
        unit: 'metre_per_second-time',
        ast:  {"value":"/","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col2","type":2,"children":[]}]},
        conv: 0
      }]
    }); 
 
    createTest({
      name:     'compound units / resolving: [m] / [s] + [ft] / [s]',
      formula:  'col1 / col3 + col2 / col3',
      binding: {
        col1: 'metre',
        col2: 'foot-international',
        col3: 'second-time'
      },
      resultCount: 2,
      results: [
        {
          unit: 'metre_per_second-time',
          ast:  {"value":"+","type":1,"children":[{"value":"/","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col3","type":2,"children":[]}]},{"value":"*","children":[{"value":"/","type":1,"children":[{"value":"col2","type":2,"children":[]},{"value":"col3","type":2,"children":[]}]},{"value":"3.048e-1","type":0}],"type":1,"pipeNull":true}]},
          conv: 1,
        }
      ],
    });

    createTest({
      name:     'flat units / harmonizing: [m] * [ft]',
      formula:  'col1 * col2',
      binding: {
        col1: 'metre',
        col2: 'foot-international',
      },
      resultCount: 2,
      results: [
        {
          unit: 'square_metre',
          ast:  {"value":"*","children":[{"value":"*","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col2","type":2,"children":[]}]},{"value":"3.048e-1","type":0}],"type":1,"pipeNull":true},
          conv: 1,
        }
      ],
    });

    createTest({
      name:     '"empty" result: [m] / [ft]',
      formula:  'col1 / col2',
      binding: {
        col1: 'metre',
        col2: 'foot-international',
      },
      resultCount: 1,
      results: [
        {
          unit: 'yavaa:one',
          ast:  {"value":"/","children":[{"value":"/","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col2","type":2,"children":[]}]},{"value":"0.3048","type":0}],"type":1},
          conv: 1,
        }
      ],
    });
    
    createTest({
      name:     '"empty" result; custom units: [one] / [thousand]',
      formula:  'col1 / col2',
      binding: {
        col1: 'yavaa:one',
        col2: 'yavaa:thousand'
      },
      resultCount: 1,
      results: [{
        unit: 'yavaa:one',
        ast:  {"value":"/","children":[{"value":"/","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col2","type":2,"children":[]}]},{"value":"1000","type":0}],"type":1},
        conv: 1
      }]
    });

    createTest({
      name:     '"empty" result; identical custom units: [one] / [one]',
      formula:  'col1 / col2',
      binding: {
        col1: 'yavaa:one',
        col2: 'yavaa:one'
      },
      resultCount: 1,
      results: [{
        unit: 'yavaa:one',
        ast:  {"value":"/","type":1,"children":[{"value":"col1","type":2,"children":[]},{"value":"col2","type":2,"children":[]}]},
        conv: 0
      }]
    });

    // constant first operand
    createConstantTest( 'unit-less constants / resolving: constant * [m]', '1 * col1' );
    createConstantTest( 'unit-less constants / resolving: constant / [m]', '1 / col1' );
    createConstantTest( 'unit-less constants / resolving: constant + [m]', '1 + col1' );
    createConstantTest( 'unit-less constants / resolving: constant 1 [m]', '1 - col1' );

    // constant second operand
    createConstantTest( 'unit-less constants / resolving: [m] * constant', 'col1 * 1' );
    createConstantTest( 'unit-less constants / resolving: [m] / constant', 'col1 / 1' );
    createConstantTest( 'unit-less constants / resolving: [m] + constant', 'col1 + 1' );
    createConstantTest( 'unit-less constants / resolving: [m] - constant', 'col1 - 1' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Test Creators XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    
    /**
     * create a single unit test for resolving a formula's resulting unit
     */
    function createTest( param ) {
      
      QUnit.test( param.name, async function( assert ){

        // async test, so get the callback
        const done = assert.async();

        try {

          // parse formula to AST
          const formula = await parseFormula( parseConstants.IN_STRING, parseConstants.OUT_AST, param.formula );
          
          // resolve bindings by Unit objects
          const boundUnits = Object.keys( param.binding )
                                   .reduce( (all,key) => {
                                     all[ key ] = replaceUnit( param.binding[ key ] );
                                     return all;
                                   }, {} );

          // run unit estimation
          const res = await estimateUnit( formula, boundUnits );

          // get resulting units
          const resUnits = await res.resolve();

          // check total number of results
          if( param.resultCount ) {
            assert.equal( resUnits.length, param.resultCount, `result has exactly ${param.resultCount} options` );
          }

          // check individual results
          for( const expectedRes of param.results ) {
            
            // resolve target unit
            const targetUnit = replaceUnit( expectedRes.unit );

            // find in result set
            const resUnit = resUnits.find( (el) => el.unit == targetUnit );
            assert.ok( !!resUnit, `one result should be in ${expectedRes.unit}` );
            if( !resUnit ) { continue; }

            // compare properties
            assert.equal( resUnit.conv,                      expectedRes.conv, `result in ${expectedRes.unit} should need ${expectedRes.conv} conversion(s)`)
            if( 'factor' in param ) {
              assert.equal( resUnit.factor.toString(),       param.factor,     `check result factor for ${expectedRes.unit}` );              
            }
            assert.yavaa_astEqual( await res.getAst( targetUnit ), expectedRes.ast,  `check AST for ${expectedRes.unit}` );
            
          }

          // check additional results (AST only)
          if( 'addResults' in param ) {
            for( let expectedRes of param.addResults ) {

              // resolve target unit
              const targetUnit = replaceUnit( expectedRes.unit );
              
              // compare AST
              assert.yavaa_astEqual( await res.getAst( targetUnit ), expectedRes.ast,  `check AST for ${expectedRes.unit}` );
              
            } 
          }          

        } catch(e) {

          // internal error
          assert.ok( false, e + "\n" + e.stack );

        }

        // finished
        done();

      });

    }
      
      
      /**
       * create a single unit test for resolving a formula's resulting unit for use with constants
       */
    function createConstantTest( title, formulaDef ) {

      QUnit.test( title, async function( assert ){

        // async test, so get the callback
        const done = assert.async();
        
        // we test with meter here
        const meter = UnitStore.getUnit( `http://www.wurvoc.org/vocabularies/om-1.8/metre` );

        try {

          // parse formula to AST
          const formula = await parseFormula( parseConstants.IN_STRING, parseConstants.OUT_AST, formulaDef );

          // run unit estimation
          const res = await estimateUnit( formula, { 'col1': meter } );

          // resolve final unit
          const resolved = await res.resolve();

          // test result
          assert.equal( resolved.length,               1,     'should be a unambigious result' );
          assert.equal( resolved[0].unit,              meter, 'result is m' );
          assert.equal( resolved[0].factor.toString(), "1",   'result factor is 1' );

          // test AST for the resolved unit
          let ast = await res.getAst( meter );
          assert.yavaa_astEqual( ast, formula, "AST should be unchanged" );

        } catch(e) {

          // internal error
          assert.ok( false, e + "\n" + e.stack );

        }

        // finished
        done();

      });

    }



    /**
     * take a unit string and convert to respective unit object
     */
    function replaceUnit( u ) {
      if( u.includes( 'yavaa:' ) ) {
        u = u.replace( 'yavaa:', '' )
        return UnitStore.getUnit( `http://yavaa.org/ns/units/${u}` );
      } else {
        return UnitStore.getUnit( `http://www.wurvoc.org/vocabularies/om-1.8/${u}` );
      }
    }

  };

});