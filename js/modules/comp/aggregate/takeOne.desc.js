"use strict";
/**
 * description for a takeOne aggregation
 */
define( [], function(){

  return {
    'name': 'take one',
    'desc': 'Take one entry from the given values. There is no guaranty to which entry is selected!',
    'datatype': [ 'all' ],
    'unbagOnly':    false,
    'expanding':    false,
    'bagging':      false
  };

});
