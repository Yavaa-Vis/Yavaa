define( [ 'store/unit.sparql',
          'basic/types/ArbNumber',
          'store/unit/estimateUnit/VirtualUnit',
          'comp/function/parseFormula/Constants',
          'asserts/astEqual'
        ],
function( UnitStore,
          ArbNumber,
          VirtualUnit,
          parseFormulaConst
         ){

  return function( QUnit ) {

    // cache some ArbNumbers
    const one = ArbNumber( 1 );

    QUnit.module( 'store/unit.sparql: convertVirtualUnits' );

    createTest({
      name: 'Equivalent units ( [ m ] / [] -> [ m ] / [] )',
      from: {
        n: [ 'metre' ],
        d: []
      },
      to: {
        n: [ 'metre' ],
        d: []
      },
      resultAST: {"type":2,"value":"value"}
    })

    createTest({
      name: 'Unit to VirtualUnit; equivalent units ( [ one ] -> [ metre ] / [ metre ] )',
      from: 'yavaa:one',
      to: {
        n: [ 'metre' ],
        d: [ 'metre' ]
      },
      resultAST: {"type":2,"value":"value"},
    })

    createTest({
      name: 'Unit to VirtualUnit ( [ one ] -> [ metre ] / [ foot ] )',
      from: 'yavaa:one',
      to: {
        n: [ 'metre' ],
        d: [ 'foot-international' ]
      },
      resultAST: {"value":"*","children":[{"value":"value","type":2},{"value":"0.3048","type":0}],"type":1},
    })
    
    createTest({
      name: 'Single unit in numerator ( [ m ] / [] -> [ ft ] / [] )',
      from: {
        n: [ 'metre' ],
        d: []
      },
      to: {
        n: [ 'foot-international' ],
        d: []
      },
      resultAST: {"type":1,"value":"/","children":[{"type":2,"value":"value"},{"type":0,"value":"3.048e-1"}]}
    })

    createTest({
      name: 'Single (compound) unit in numerator ( [ gallon ] / [] -> [ m^3 ] / [] )',
      from: {
        n: [ 'dry_gallon-US' ],
        d: []
      },
      to: {
        n: [ 'metre', 'metre', 'metre' ],
        d: []
      },
      resultAST: {"type":1,"value":"*","children":[{"type":2,"value":"value"},{"type":0,"value":"0.00440488377086"}]},
    })

    createTest({
      name: 'Single unit in denominator ( [] / [ m ] -> [] / [ ft ] )',
      from: {
        n: [],
        d: [ 'metre' ]
      },
      to: {
        n: [],
        d: [ 'foot-international' ]
      },
      resultAST: {"type":1,"value":"*","children":[{"type":2,"value":"value"},{"type":0,"value":"3.048e-1"}]},
    })

    createTest({
      name: 'Equivalent units in different representation ( [ sqm ] / [ m ] -> [ m ] / [] )',
      from: {
        n: [ 'square_metre' ],
        d: [ 'metre' ]
      },
      to: {
        n: [ 'metre' ],
        d: []
      },
      resultAST: {"type":2,"value":"value"},
    })

    createTest({
      name: 'Units of different dimensions ( [ gallon ] / [ m ] -> [ m m ] / [] )',
      from: {
        n: [ 'dry_gallon-US' ],
        d: [ 'metre' ]
      },
      to: {
        n: [ 'metre', 'metre' ],
        d: []
      },
      resultAST: {"type":1,"value":"*","children":[{"type":2,"value":"value"},{"type":0,"value":"0.00440488377086"}]},
    })

    createTest({
      name: 'Multiple units; just one to convert ( [ m kg ] / [] -> [ ft kg ] / [] )',
      from: {
        n: [ 'metre', 'kilogram' ],
        d: []
      },
      to: {
        n: [ 'foot-international', 'kilogram' ],
        d: []
      },
      resultAST: {"type":1,"value":"/","children":[{"type":2,"value":"value"},{"type":0,"value":"3.048e-1"}]},
    })

    createTest({
      name: 'Multiple units; multiple to convert ( [ m kg ] / [] -> [ ft g ] / [] )',
      from: {
        n: [ 'metre', 'kilogram' ],
        d: []
      },
      to: {
        n: [ 'foot-international', 'gram' ],
        d: []
      },
      resultAST: {"value":"/","children":[{"value":"*","children":[{"value":"value","type":2},{"value":"1000","type":0}],"type":1},{"value":"0.3048","type":0}],"type":1},
    })

    createTest({
      name: 'Multiple units; multiple to convert; split over numerator/denominator ( [ m ] / [ kg ] -> [ ft ] / [ g ] )',
      from: {
        n: [ 'metre' ],
        d: [ 'kilogram' ]
      },
      to: {
        n: [ 'foot-international' ],
        d: [ 'gram' ]
      },
      resultAST: {"value":"/","children":[{"value":"/","children":[{"value":"value","type":2},{"value":"0.3048","type":0}],"type":1},{"value":"1000","type":0}],"type":1},
    })

    createTest({
      name: 'Multiple units; single to convert ( [ m ] / [ kg ] -> [ ft ] / [ kg ] )',
      from: {
        n: [ 'metre' ],
        d: [ 'kilogram' ]
      },
      to: {
        n: [ 'foot-international' ],
        d: [ 'kilogram' ]
      },
      resultAST: {"type":1,"value":"/","children":[{"type":2,"value":"value"},{"type":0,"value":"3.048e-1"}]},
    })

    createTest({
      name: 'Same units (numerator) different factor ( 1000 * [ m ] / [] -> [ m ] / [] )',
      from: {
        n: [ 'metre' ],
        d: [],
        f: ArbNumber( 1000 )
      },
      to: {
        n: [ 'metre' ],
        d: []
      },
      resultAST: {"type":1,"value":"*","children":[{"type":2,"value":"value"},{"type":0,"value":"1000"}]},
    })

    createTest({
      name: 'Same units (denominator) different factor ( 1000 * [] / [ m ] -> [] / [ m ] )',
      from: {
        n: [],
        d: [ 'metre'  ],
        f: ArbNumber( 1000 )
      },
      to: {
        n: [],
        d: [ 'metre' ]
      },
      resultAST: {"type":1,"value":"*","children":[{"type":2,"value":"value"},{"type":0,"value":"1000"}]},
    })

    createTest({
      name: 'Single scaled unit (numerator) ( [ °F ] / [] -> [ °C ] / [] )',
      from: {
        n: [ 'degree_Fahrenheit' ],
        d: []
      },
      to: {
        n: [ 'degree_Celsius' ],
        d: []
      },
      resultAST: {"type":1,"value":"+","children":[{"type":1,"value":"/","children":[{"type":1,"value":"-","children":[{"type":2,"value":"value"},{"type":0,"value":"-459.67"}]},{"type":0,"value":"1.8"}]},{"type":0,"value":"-273.15"}]},
    })

    createTest({
      name: 'Single scaled unit (denominator) ( [] / [ °F ] -> [] / [ °C ] )',
      from: {
        n: [],
        d: [ 'degree_Fahrenheit' ]
      },
      to: {
        n: [],
        d: [ 'degree_Celsius' ]
      },
      resultAST: {"type":1,"value":"/","children":[{"type":0,"value":"1"},{"type":1,"value":"+","children":[{"type":1,"value":"/","children":[{"type":1,"value":"-","children":[{"type":2,"value":"value"},{"type":0,"value":"-459.67"}]},{"type":0,"value":"1.8"}]},{"type":0,"value":"-273.15"}]}]},
    })

    createTest({
      name: 'Single scaled unit + others ( [ °F m ] / [] -> [ °C m ] / [] )',
      from: {
        n: [ 'degree_Fahrenheit', 'metre' ],
        d: []
      },
      to: {
        n: [ 'degree_Celsius', 'metre' ],
        d: []
      },
      resultAST: {"type":1,"value":"+","children":[{"type":1,"value":"/","children":[{"type":1,"value":"-","children":[{"type":2,"value":"value"},{"type":0,"value":"-459.67"}]},{"type":0,"value":"1.8"}]},{"type":0,"value":"-273.15"}]},
    })

    createTest({
      name: 'Single scaled unit + mixed others ( [ °F m ] / [] -> [ °C ft ] / [] )',
      from: {
        n: [ 'degree_Fahrenheit', 'metre' ],
        d: []
      },
      to: {
        n: [ 'degree_Celsius', 'foot-international' ],
        d: []
      },
      resultThrow: true,
    })

    createTest({
      name: 'VirtualUnit to Unit; one ( [ one ] / [ thousand ] -> [ one ] )',
      from: {
        n: [ 'yavaa:one' ],
        d: [ 'yavaa:thousand' ]
      },
      to: 'yavaa:one',
      resultAST: {"value":"/","children":[{"value":"value","type":2},{"value":1000,"type":0}],"type":1},
    })

    createTest({
      name: 'VirtualUnit to Unit; one ( [ million ] / [ thousand ] -> [ one ] )',
      from: {
        n: [ 'yavaa:million' ],
        d: [ 'yavaa:thousand' ]
      },
      to: 'yavaa:one',
      resultAST: {"value":"/","children":[{"value":"*","children":[{"value":"value","type":2},{"value":"1000000","type":0}],"type":1},{"value":"1000","type":0}],"type":1},
    })

    /* --------------------------------------------------------------------- */

    /**
     * create a single testcase
     */
    function createTest( param ) {
      
      QUnit.test( param.name, async function( assert ){

        // async test, so get the callback
        const done = assert.async();

        try {
          
          // replace all components by the respective unit objects
          const involvedUnits = [];
          if( typeof param.from == 'string' ) {
            param.from = replaceUnit( param.from );
            involvedUnits.push( param.from );
          } else {
            param.from.n  = param.from.n.map( replaceUnit );
            param.from.d  = param.from.d.map( replaceUnit );
            involvedUnits.push( ... param.from.n );
            involvedUnits.push( ... param.from.d );
          }
          if( typeof param.to == 'string' ) {
            param.to = replaceUnit( param.to );
            involvedUnits.push( param.to );
          } else {
            param.to.n    = param.to.n.map( replaceUnit );
            param.to.d    = param.to.d.map( replaceUnit );
            involvedUnits.push( ... param.to.n );
            involvedUnits.push( ... param.to.d );
          }

          // populate units
          await UnitStore.populateCompounds( involvedUnits );

          // build the respective VirtualUnits
          const v1 = param.from.n instanceof Array
                     ? new VirtualUnit( { num: param.from.n, denom: param.from.d, prefixFactor: (('f' in param.from) ? param.from.f : one) } )
                     : param.from,
                v2 = param.to.n instanceof Array
                     ? new VirtualUnit( { num: param.to.n,   denom: param.to.d,   prefixFactor: (('f' in param.to)   ? param.to.f   : one) } )
                     : param.to;

          // request conversion between both
          const convAST = await UnitStore.convertVirtualUnits( v1, v2, parseFormulaConst.OUT_AST );

          if( param.resultThrow ) {
            // impossible conversions
            assert.ok( false, 'This should fail!' );
          } else {
            // check the AST
            assert.yavaa_astEqual( convAST, param.resultAST, "check AST" );            
          }

        } catch(e) {

          if( param.resultThrow ) {
            // impossible conversions
            assert.ok( true, 'This should fail!' );
          } else {
            // internal error
            assert.ok( false, e + "\n" + e.stack );       
          }

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

 }
});
