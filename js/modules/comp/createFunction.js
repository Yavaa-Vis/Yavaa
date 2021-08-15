"use strict";
/**
 * convert a given user defined function given as string to an executable function
 */
define([  'comp/function/parseFormula',
          'comp/function/createFunction',
          'store/data'
       ], function(
          parseFormula,
          convertToFunction,
          DataStore
       ){

  /**
   * apply a user defined function to a dataset
   * @param {Number}  data_id     identifier of the dataset
   * @param {Number}  col_id      identifier of the column
   * @param {String}  funktion    funktion to apply
   */
  return async function createFunction( data_id, col_id, funktionStr, isNewCol ) {

    // parse function
    var funktionData = await parseFormula( null, null, funktionStr ),

    // create JS function out of it
        appFunktion = convertToFunction( funktionData );

    // we will need the function itself and the list of requested values later on
    return {
      funktion: appFunktion,
      values:   funktionData.variables
    };

  };

});