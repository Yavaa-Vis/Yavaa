/**
 * Provide access to the unit related functions
 */
"use strict";
define( [ 'store/unit' ],
function( UnitStore    ){

  return {
    'getCompatibleUnits': getCompatibleUnits,
  };


  /**
   * create a list of suggested visualizations
   */
  async function getCompatibleUnits( param ) {

    // convert input to Unit object
    const unit = UnitStore.getUnit( param.unit.uri );

    // retrieve list of compatible units
    const res = await UnitStore.getCompatibleUnits( unit );

    // done
    return {
      'action': 'compatibleUnits',
      'params': {
        'unit': unit.getURI(),
        'units': res.units,
        'systems': res.systems,
      }
    };
  }

});