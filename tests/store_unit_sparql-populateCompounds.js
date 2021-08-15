define( [ 'store/unit.sparql', 
          'store/unit/estimateUnit/VirtualUnit',
          'basic/types/ArbNumber' ],
function( UnitStore,
          VirtualUnit,
          ArbNumber ){

  return function( QUnit ) {

    QUnit.module( 'store/unit.sparql: populateCompounds' );

    
    createTest({
      name: 'resolve base unit (meter)',
      unit: 'metre',
      result:{
        factor:   '1',
        num:      [ 'metre' ],
        denom:    []
      }
    });
    
    createTest({
      name: 'resolve prefixed unit (kilogram)',
      unit: 'kilogram',
      result:{
        factor:   '1000',
        num:      [ 'gram' ],
        denom:    []
      }
    });
    
    createTest({
      name: 'resolve compound unit (newton)',
      unit: 'newton',
      result:{
        factor:   '1000',
        num:      [ 'gram', 'metre' ],
        denom:    [ 'second-time', 'second-time' ]
      }
    });
    
    createTest({
      name: 'resolve compound unit (squaremetre)',
      unit: 'square_metre',
      result:{
        factor:   '1',
        num:      [ 'metre', 'metre' ],
        denom:    []
      }
    });
    
    createTest({
      name: 'resolve compound virtual unit ( [squaremetre] / [] )',
      unit: {
        num:          [ 'square_metre' ],
        denom:        [],
        prefixFactor: 1,
      },
      result:{
        factor:   '1',
        num:      [ 'metre', 'metre' ],
        denom:    []
      }
    });
    
    createTest({
      name: 'resolve compound unit (degree celsius)',
      unit: 'degree_Celsius',
      result:{
        factor:   '1',
        num:      [ 'degree_Celsius' ],
        denom:    []
      }
    });

    /* --------------------------------------------------------------------- */

    /**
       * create a single testcase
     */
    function createTest( param ) {
      
      QUnit.test( param.name, async function( assert ){

        // async test, so get the callback
        const done = assert.async();
        
        // replace all units with the respective unit objects
        if( typeof param.unit == 'string' ) {
          // plain unit
          param.unit  = replaceUnit( param.unit );
        } else {
          // virtual unit
          param.unit.num    = param.unit.num.map( replaceUnit );
          param.unit.denom  = param.unit.denom.map( replaceUnit );
          param.unit.prefixFactor = ArbNumber( param.unit.prefixFactor );
          param.unit = new VirtualUnit( param.unit, false );
        }
        param.result.num   = param.result.num.map( replaceUnit );
        param.result.denom = param.result.denom.map( replaceUnit );
          
        // populate
        await UnitStore.populateCompounds( param.unit )
        
        // shortcuts
        const comp = param.unit._compounds,
              res  = param.result;
        
        // sort arrays
        comp.num.sort( sortUnitsByHash );
        comp.denom.sort( sortUnitsByHash );
        res.num.sort( sortUnitsByHash );
        res.denom.sort( sortUnitsByHash );
        
        // assertions
        assert.equal( comp.prefixFactor,  res.factor, `check prefix factor` );
        assert.deepEqual( comp.num,       res.num,    `check numerator`  );
        assert.deepEqual( comp.denom,     res.denom,  `check denominator`  );
        
        done();

      });
      
    }
    
  };


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

});