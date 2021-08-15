"use strict";
/**
 * Provide some hooks for debugging and evaluation
 */
define([],
function(){

  return {
    getMemory: getMemory,
  };


  /**
   * get the memory of the current process
   */
  function getMemory() {

    // try to run the garbage collection before
    if( (typeof global != 'undefined') && ('gc' in global)) {
      global.gc();
    }

    // try to retrieve the memory consumption
    let size = -1;
    if( typeof process != 'undefined' ) {
      size = process.memoryUsage().rss;
    }

    return {
      action: 'memory',
      params: {
        size: size,
      },
    };

  }

});
