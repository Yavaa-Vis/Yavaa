"use strict";
/**
 * description for a set aggregation
 */
define( [], function(){

  return {
    'name': 'set',
    'desc': 'Collects all values in a Bag. Removes duplicate entries!',
    'datatype': [ 'all' ],
    'unbagOnly':    false,
    'expanding':    false,
    'bagging':      true
  };

});
