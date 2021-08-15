"use strict";
/**
 * constant folding within the AST
 *
 */
define( [
         'basic/types/ArbNumber',
         'comp/function/parseFormula/Constants',
], function(
         ArbNumber,
         pConst
){

  return {
    apply:    foldConstants,
    teardown: function(){}
  }

  function foldConstants( node ) {

    // constant folding just cares about OPs
    if( node.type == pConst.TOKEN_OP ) {

      // we don't want to handle division as of here, as the accuracy is not known
      if( node.value == '/' ) {
        return node;
      }

      // get both operands
      var left  = node.children[0],
          right = node.children[1];

      // both need to be numbers for folding
      if( (left.type == pConst.TOKEN_NUMBER) && (right.type == pConst.TOKEN_NUMBER) ) {

        // convert the operands to something we can work with
        var leftOp = new ArbNumber( left.value ),
            rightOp= new ArbNumber( right.value );

        // do the operation
        var result;
        switch( node.value ) {
          case '*': result = leftOp['mul']( rightOp ); break;
          case '+': result = leftOp['add']( rightOp ); break;
          case '-': result = leftOp['sub']( rightOp ); break;
          default: throw Error( `comp/function/parseFormula/optimize/constantFolding: Unknown operand: ${node.value}` );
        }

        // replace the current node with the result
        node.type = pConst.TOKEN_NUMBER;
        node.value = result.toString();
        delete node.children;

      }
    }

    return node;

  }

});