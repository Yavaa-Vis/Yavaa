"use strict";
/**
 * handle unit of measurement related tasks
 *
 */
define( [ 'load/SparqlClient',
          'basic/types/Unit',
          'store/unit/estimateUnit/VirtualUnit',
          'config/unit.sparql',
          'util/flatten.sparql',
          'store/unit/populateCompounds',
          'store/unit/convertUnits',
          'store/unit/convertVirtualUnits',
          'store/unit/populateConversionBase',
          'store/unit/populateUnits',
          'store/unit/resolveVirtualUnit',
          'store/unit/getCompatibleUnits',
          'store/unit/getBaseunit',
          'text!template/query/unit/diffPrefixedUnits.rq',
          'text!template/query/unit/getUnitsByDimVector.rq',
          ],
function( SparqlClient,
          Unit,
          VirtualUnit,
          cfg,
          flattenResult,
          populateCompounds,
          convertUnits,
          convertVirtualUnits,
          populateConversionBase,
          populateUnits,
          resolveVirtualUnit,
          getCompatibleUnits,
          getBaseunit,
          queryDiffPrefixedUnits,
          queryGetUnitsByDimVector
          ){

  // get a pointer to the SPARQL client
  let client = new SparqlClient( cfg['endpoint'] );

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX unitCache XXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  // cache of unit objects
  let unitCache = {};

  // "hash" number for next unit
  let unitCacheHash = 0;

  /**
   * return a Unit object for the given requested unit
   * use a cached version, if existent
   * ensures, that there is always just one object per unit
   */
  function getUnit( unitId ) {

    // unitId has to be a string
    if( typeof unitId !== 'string' ) {
      throw new Error( 'unitId has to be given as String!' );
    }

    // we have a cached version
    if( unitId in unitCache ) {
      return unitCache[ unitId ];
    }

    // we have to create a new object
    let unit = new Unit( unitId );
    unit._setVal( '_hash', '' + unitCacheHash++, true );
    unitCache[ unitId ] = unit;
    return unit;

  }

  /**
   * clear (parts of) the unit cache
   * @param {String*}   optional unitId of a unit to be removed from the cache
   */
  function clearUnitCache( unitId ) {

    // just one unitId given
    if( unitId ) {
      delete unitCache[ unitId ];
      return;
    }

    // else clear the whole cache
    unitCache = {};

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXX getUnitsByDimVector XXXXXXXXXXXXXXXXXXXXXXXXX */

  function getUnitsByDimVector( dimVector, singular ) {

    // default value
    singular = singular || false;

    // translate dim vector to query args
    let args = {
      dimL:   +dimVector[0],
      dimM:   +dimVector[1],
      dimT:   +dimVector[2],
      dimI:   +dimVector[3],
      dimTh:  +dimVector[4],
      dimN:   +dimVector[5],
      dimJ:   +dimVector[6],
      onlySingular: !!singular
    };

    // run query
    return client.query( queryGetUnitsByDimVector, args )
                  .then( (d) => {
                    return parseResultsToUnits.call( this, d, dimVector );
                  });
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXX getOtherPrefixes XXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return a list of differently prefixed versions of a given unit
   */
  function getOtherPrefixes( unit ) {

    // needed to deal with the circular dependency
    // http://requirejs.org/docs/api.html#circular
    Unit = require( 'basic/types/Unit' );

    // query for unit data
    return this.populateUnits( unit )
                  .then( function(){
                    return client.query( queryDiffPrefixedUnits, { 'unit': { 'value': unit.getURI(), 'type': 'uri' } } );
                  })
                  .then( (d) => {
                    return parseResultsToUnits.call( this, d, unit.getDimVector() );
                  });
  }


  /**
   * given a SPARQL query result with the following properties,
   * return an array with all included units
   *
   * required fields:
   * - unit
   * - label
   * - dimension
   * - symbol
   * - isScaled
   */
  function parseResultsToUnits( d, dimVector ) {

    // flatten result
    d = flattenResult( d );

    // resulting units
    let resUnits = [];

    // parse all entries
    for( let i=0; i<d.length; i++ ) {

      // create new unit object
      let u = this.getUnit( d[i]['unit'] );

      // add to result
      resUnits.push( u );

      // populate, if needed
      if( !u.isPopulated() ) {

        // augment with other data
        u._setVal( '_label',     d[i]['label'] );
        u._setVal( '_dimension', d[i]['dimension'] );
        u._setVal( '_symbol',    d[i]['symbol'] );
        u._setVal( '_isScaled',  d[i]['isScaled'] );

        // dimension vector is the same as the source unit
        u._setVal( '_dimVector', dimVector );

      }

    }

    return resUnits;
  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  const UnitStore = {
    'populateUnits':      populateUnits,
    'getOtherPrefixes':   getOtherPrefixes,
    'getUnitsByDimVector':getUnitsByDimVector,
    'convertUnits':       convertUnits,
    'convertVirtualUnits':convertVirtualUnits,
    'getUnit':            getUnit,
    'clearUnitCache':     clearUnitCache,
    'populateCompounds':  populateCompounds,
    'populateConversionBase':  populateConversionBase,
    'resolveVirtualUnit': resolveVirtualUnit,
    'getCompatibleUnits': getCompatibleUnits,
    'getBaseunit':        getBaseunit,
    '_client':            client,               // outsourced methods need access as well
  }

  // attach the store to both Unit and VirtualUnit prototypes
  Unit.prototype._store = UnitStore;
  VirtualUnit.prototype._store = UnitStore;

  return UnitStore;
});