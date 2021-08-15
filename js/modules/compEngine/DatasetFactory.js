"use strict";
/**
 * create a dataset by adding consecutive rows
 */
define([ 'basic/types/Dataset' ], function( Dataset ){

  function DatasetFactory( colCount ) {
    // init instance variables
    this._colCount = colCount;
    this._cols = [];
    for( var i=0; i<colCount; i++ ) {
      this._cols.push( [] );
    }
  }


  /**
   * add a row to the dataset
   */
  DatasetFactory.prototype['addRow'] = function( row ) {

    // make sure we get an array to work with
    if( !(row instanceof Array) ) {
      row = arguments;
    }

    // check for correct amount
    if( row.length != this._colCount ) {
      throw new Error( 'Amount of values does not match column count' );
      return;
    }

    // insert values to respective arrays
    for( var i=0; i<this._colCount; i++ ) {
      this._cols[i].push( row[i] );
    }

  }

  /**
   * retrieve the actual created dataset
   */
  DatasetFactory.prototype['getDS'] = function() {
    return null;
  }


  return DatasetFactory;
});