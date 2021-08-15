"use strict";
/**
 * description for a unbag expansion
 */
define( [], function(){

  return {
    'name':         'unbag',
    'desc':         'Extract all the individual entries from a bag and separate them again.',
    'datatype':     [ 'bag' ],
    'subdatatype':  [ 'all' ],
    'unbagOnly':    true,
    'expanding':    true,
    'bagging':      false
  };

});
