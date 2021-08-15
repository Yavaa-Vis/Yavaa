"use strict";
define( [ 'util/flatten.sparql',
          'text!template/query/unit/populateUnit.rq',
          'text!template/query/unit/getDimVector.rq',
], function(
          flattenResult,
          queryPopulateUnit,
          queryDimVector
){

  // dimension vector mapping
  const dimMap = [
              'http://www.wurvoc.org/vocabularies/om-1.8/SI_length_dimension_exponent',
              'http://www.wurvoc.org/vocabularies/om-1.8/SI_mass_dimension_exponent',
              'http://www.wurvoc.org/vocabularies/om-1.8/SI_time_dimension_exponent',
              'http://www.wurvoc.org/vocabularies/om-1.8/SI_electric_current_dimension_exponent',
              'http://www.wurvoc.org/vocabularies/om-1.8/SI_thermodynamic_temperature_dimension_exponent',
              'http://www.wurvoc.org/vocabularies/om-1.8/SI_amount_of_substance_dimension_exponent',
              'http://www.wurvoc.org/vocabularies/om-1.8/SI_luminous_intensity_dimension_exponent'
            ];


  /**
   * augments the given units with its respective details:
   * - label
   * - dimension
   * - symbol
   * - isScaled
   */
  async function populateUnits( units ) {

    // make sure, we are working with an array here
    if( units instanceof Set ) {
      units = [ ... units ];
    }
    if( !(units instanceof Array) ) {
      units = [ units ];
    }

    // make unit list unique
    const uniqueUnits = [ ... new Set( units ) ];

    // get identifiers for those, that have not been augmented yet
    const unitsToAugment = uniqueUnits.filter( ( unit ) => {
            return unit && !unit.isPopulated();
          })
          .map( ( unit ) => {
            return {
              'value': unit.getURI(),
              'type':  'uri'
            }
          });

    // shortcut, if there is nothing to do
    if( unitsToAugment.length < 1 ){
      return units;
    }

    // create a lookup for the units to augment
    const lookup = {};
    for( let i=0; i<units.length; i++ ) {
      lookup[ units[i].getURI() ] = units[i];
    }

    // query for unit data
    const raw = await this._client.query( queryPopulateUnit, { 'units': unitsToAugment })

    // flatten the result
    const data = flattenResult( raw );

    // augment with data and extract all dimensions
    const dims = new Set();
    for( let d of data ) {

      // get the unit
      const unit = lookup[ d.unit ];

      // there might have been a parallel request doing the same
      // so prevent double assignment here
      if( unit.isPopulated() ) {
        continue;
      }

      // augment unit
      addPopData( unit, d );

      // collect dimension
      dims.add( unit.getDimension() );

    }

    // prep input
    const dimInput = [ ... dims ].map( el => {
                                    return {
                                      'value': el,
                                      'type':  'uri'
                                    }
                                  });

    // short circuit, if none to retrieve
    if( dimInput.length > 0  ){

      const vectorRaw = await this._client.query( queryDimVector, { 'dim': dimInput })

      // flatten result
      const vectors = flattenResult( vectorRaw );
      const dims = {};
      for( let vector of vectors ) {
        dims[ vector.dim ] = dims[ vector.dim ] || [];
        dims[ vector.dim ].push( vector );
      }

      // augment all units
      for( let i=0; i<unitsToAugment.length; i++ ) {

        // get the unit
        const unit = lookup[ unitsToAugment[i].value ];

        // there might have been a parallel request doing the same
        // so prevent double assignment here
        if( '_dimVector' in unit ) {
          continue;
        }

        // augment unit
        addDimData( unit, dims[ unit.getDimension() ] );

      }
    }

    // return all units
    return uniqueUnits;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXX Helper Functions XXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * add the populate-data to a unit
   */
  function addPopData( unit, vals ) {

    // augment the unit
    unit._setVal( '_label',     vals['label'] );
    unit._setVal( '_dimension', vals['dimension'] );
    unit._setVal( '_symbol',    vals['symbol'] );
    unit._setVal( '_isScaled',  vals['isScaled'] );

  }

  /**
   * add the dimension vector to a unit
   */
  function addDimData( unit, vals ) {

    // if there is no data to add, skip this
    if( !vals ) {
      return;
    }

    // convert to dimension vector
    var map = {};
    for( var i=0; i<vals.length; i++ ) {
      map[ vals[i]['prop'] ] = +vals[i]['exp'];
    }
    var vector = [];
    for( var i=0; i<dimMap.length; i++ ) {
      vector.push( map[ dimMap[i] ] || 0 );
    }

    // attach
    unit._setVal( '_dimVector', vector );

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return populateUnits;

});