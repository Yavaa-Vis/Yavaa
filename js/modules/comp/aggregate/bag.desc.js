"use strict";
/**
 * description for a bag aggregation
 */
define( [], function(){

  return {
    'name': 'bag',
    'desc': 'Collects all values in a Bag. Keeps duplicate entries!',
    'datatype': [ 'all' ],
    'defaultOption':true,
    'unbagOnly':    false,
    'expanding':    false,
    'bagging':      true
  };

});
