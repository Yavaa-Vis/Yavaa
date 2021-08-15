"use strict";
/**
 * description for a avg aggregation
 */
define( [ 'basic/Constants' ], function( Constants ){

  return {
    'name': 'average',
    'desc': 'Calculate the respective average.',
    'datatype': [ Constants.DATATYPE.NUMERIC ],
    'unbagOnly':    false,
    'expanding':    false,
    'bagging':      false
  };

});
