"use strict";
/**
 * register optimizations for ASTs
 *
 * structure:
 * {
 *    order:      String                 // post-, or pre-order walk the AST
 *    funktions:  Array[String]          // modules to apply in this run
 * }
 */
define( [], function(){

  return [

    {
      order:      'post',
      funktions:  [ 'constantFolding' ]
    }

  ]

});