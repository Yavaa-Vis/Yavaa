"use strict";
/**
 * returns a list of phase 2 transformation rules for estimateUnit
 */
define( [
          'store/unit/estimateUnit/rules/sortSummandsByUnit',
          'store/unit/estimateUnit/rules/limitToTwoOperands'
], function(){

  var rules = Array.prototype.slice.call(arguments);

  return rules;

});