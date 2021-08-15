"use strict";
/**
 * description for a sum aggregation
 */
define( [ 'basic/Constants' ], function( Constants ){

  return {
    'name': 'sum',
    'desc': 'Calculate the respective sum.',
    'datatype': [ Constants.DATATYPE.NUMERIC ],
    'unbagOnly':    false,
    'expanding':    false,
    'bagging':      false
  };

});
