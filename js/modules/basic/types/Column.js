"use strict";
/**
 * Wrapper for column meta data
 * Engine Edition
 */
define( [ 'shared/types/Column',
          'store/unit'
        ],
function( Column,
          UnitStore
        ){


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXX distinct values XXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * set the distinct values for this column
   * @param distVals
   */
  Column.prototype.setDistinctValues = function setDistinctValues( distValues ) {
    Object.freeze( distValues );
    this._setVal( '_distValues', distValues );
  }


  /**
   * get the distinct values for this column
   */
  Column.prototype.getDistinctValues = function getDistinctValues() {
    if( '_distValues' in this ) {
      return this['_distValues'];
    } else {
      return null;
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Setter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  Column.prototype.setDatatype = function setDatatype( type ){
    this['_meta']['datatype'] = type;
  }


  Column.prototype.setUnit = function setUnit( unit ) {
    if( typeof unit == "string" ) {
      unit = UnitStore.getUnit( unit );
    }
    this._meta.unit = unit;
  }


  // export
  return Column;
});