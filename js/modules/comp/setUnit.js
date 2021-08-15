"use strict";
/**
 * set or change the unit of an existing column
 */
define( [ 'store/data',
          'store/unit',
          'comp/applyFunction',
          'comp/function/parseFormula/Constants',
        ],
function( DataStore,
          UnitStore,
          applyFunction,
          parseConstants ){

  return async function setUnit( data_id, col_id, unit ){

    // get metadata object for the requested dataset
    const meta = DataStore.getMeta( data_id );

    // get involved units
    const oldUnit = meta.columns[ col_id ].getUnit(),
          newUnit = UnitStore.getUnit( unit );

    // shortcircuit some cases
    if( !oldUnit ) {
      // no unit before, so we just set it
      const ds   = DataStore.getDataset( data_id ),
            col  = ds.getMeta().columns[ col_id ];
      col.setUnit( newUnit );
      return data_id;
    }
    if( oldUnit.getURI() == newUnit.getURI() ) {
      // no change in unit
      return data_id;
    }

    // get conversion function
    const fktDef = await UnitStore.convertUnits( oldUnit, newUnit, parseConstants.OUT_AST_LABELED );

    // apply conversion function
    const res = await applyFunction( data_id, col_id, fktDef, 'AST', false );

    // we have to adjust the unit for the new dataset
    const dsId = res.dsId,
          ds   = DataStore.getDataset( dsId ),
          col  = ds.getMeta().columns[ col_id ];
    col.setUnit( newUnit );

    // pass on
    return dsId;

  }

});