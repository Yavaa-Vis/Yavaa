"use strict";
/**
 * test unit.sparql.getBaseunits
 * 
 * finding paths to the base unit of a dimension alongside all factors required
 * 
 */
define( [ 
          'store/unit.sparql',
          'basic/types/ArbNumber'
        ],
function( 
          UnitStore,
          ArbNumber
){

  return function( QUnit ) {

    QUnit.module( 'store/unit.sparql: getBaseunit' );
    
    createTest({
      name: 'Base Unit: om:metre',
      source: [ 'metre' ],
      result: [
        {
          unit: 'metre',
          base: 'metre',
          factors: [], 
        }
      ],
    });

    createTest({
      name: 'Prefixed unit: om:kilogram',
      source: [ 'kilogram' ],
      result: [
        {
          unit: 'kilogram',
          base: 'gram',
          factors: [ ArbNumber( 1000 ) ], 
        }
      ],
    }); 
    
    createTest({
      name: 'Non-prefixed unit: om:foot-international',
      source: [ 'foot-international' ],
      result: [
        {
          unit: 'foot-international',
          base: 'metre',
          factors: [ ArbNumber( '0.3048' ) ], 
        }
      ],
    });
    
    createTest({
      name: 'Custom unit: yavaa:thousand',
      source: [ 'yavaa:thousand' ],
      result: [
        {
          unit: 'yavaa:thousand',
          base: 'yavaa:one',
          factors: [ ArbNumber( 1000 ) ], 
        }
      ],
    });
    
    createTest({
      name: 'Multiple hops: om:pica-TeX',
      source: [ 'pica-TeX' ],
      result: [
        {
          unit: 'pica-TeX',
          base: 'metre',
          factors: [ 
                     ArbNumber( 12 ), 
                     ArbNumber( '0.013837000138370001383700013837'),
                     ArbNumber( '0.0254' ) 
                   ], 
        }
      ],
    });
    
    createTest({
      name: 'Compound unit: om:dry_gallon-US',
      source: [ 'dry_gallon-US' ],
      result: [
        {
          unit: 'dry_gallon-US',
          base: [ 'metre', 'metre', 'metre' ],
          factors: [ 
                     ArbNumber( '0.00440488377086' ), 
                   ], 
        }
      ],
    });
    
    createTest({
      name: 'Compound unit: om:newton',
      source: [ 'newton' ],
      result: [
        {
          unit: 'newton',
          base: {
            num: [ 'metre', 'gram' ],
            denom: [ 'second-time', 'second-time' ],
          },
          factors: [ ArbNumber( 1000 ) ], 
        }
      ],
    });

    /* --------------------------------------------------------------------- */

    /**
     * create a single testcase
     */
    function createTest( param ) {
      
      QUnit.test( param.name, async ( assert ) => {

        // async test, so get the callback
        const done = assert.async();

        try {
          
          // get input unit object
          const inputUnits = param.source.map( replaceUnit );

          // request conversion path to the base
          const paths = await UnitStore.getBaseunit( inputUnits );

          if( param.resultThrow ) {
            
            // impossible conversions
            assert.ok( false, 'This should fail!' );
            
          } else {
            
            // validate result
            assert.ok( paths instanceof Array, 'result should be an array' );
            if( paths instanceof Array ){
              assert.ok( paths.length <= param.source.length, 'should have at most as many results as inputs' );
              
              // validate all expected results
              for( const exp of param.result ) {
                
                // make sure structure adheres to what we expect
                if( typeof exp.base == 'string' ) {
                  exp.base = {
                      num:    [ exp.base ],
                      denom:  [],
                  };
                }
                if( exp.base instanceof Array ) {
                  exp.base = {
                      num:    exp.base,
                      denom:  [],
                  };
                }
                if( exp.factors instanceof Array ) {
                  exp.factors = {
                      num:    exp.factors,
                      denom:  []
                  };
                }

                // replace inputs with unit objects
                exp.unit = replaceUnit( exp.unit );
                exp.base.num   = exp.base.num.map( replaceUnit );
                exp.base.denom = exp.base.denom.map( replaceUnit );

                // find matching result entry
                const res = paths.find( (r) => r.unit == exp.unit );

                // sort all lists
                exp.base.num.sort( sortUnitsByHash );
                exp.base.denom.sort( sortUnitsByHash );
                res.base.num.sort( sortUnitsByHash );
                res.base.denom.sort( sortUnitsByHash );

                // validate
                assert.ok( res, `result should have an entry for ${exp.unit}` );
                if( res ) {
                  
                  
                  assert.deepEqual( res.base.num, exp.base.num, `validate base numerator for ${exp.unit}` );
                  assert.deepEqual( res.base.denom, exp.base.denom, `validate base denominator for ${exp.unit}` );
                  
                  
                  assert.ok( [ ... res.factors.num, ... res.factors.denom ].every( (f) => f instanceof ArbNumber ), `list of factors should only contain ArbNumbers for ${exp.unit}` );
                  assert.deepEqual( 
                      res.factors.num.map( (f) => f.toString() ), 
                      exp.factors.num.map( (f) => f.toString() ), 
                      `validate numerical values of factor list (numerator) for ${exp.unit}` );
                  assert.deepEqual( 
                      res.factors.denom.map( (f) => f.toString() ), 
                      exp.factors.denom.map( (f) => f.toString() ), 
                      `validate numerical values of factor list (denominator) for ${exp.unit}` );
                  
                }
                
              }

            }
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
     * sort an array of Unit -objects by the respective hash
     */
    function sortUnitsByHash( a, b ) {
      return a.getHash().localeCompare( b.getHash() );
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
