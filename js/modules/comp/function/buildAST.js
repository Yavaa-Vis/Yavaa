"use strict";
/**
 * builds an Abstract Syntax Tree out of a given formula in postfix
 */
define( [ 'comp/function/parseFormula'], function( parseFormula ){

  // constant to signal AST node
  parseFormula.TOKEN_AST_NODE = 10;


  function buildAST( postfix ) {

    // variables needed
    var out = [],
        i, leftHand, rightHand, operand;

    for( i=0; i<postfix.length; i++ ) {

      if( postfix[i].type === parseFormula.TOKEN_OP ) {


          // we need at least two values on the output queue
          if( out.length < 2 ) {
            err( 'buildAST', 'Missing operators for operand (' + i + '): ' + postfix[i].value );
            return null;
          }

          // pop 2 variables from out
          rightHand = out.pop();
          leftHand = out.pop();

          // push the new term on the output AST
          out.push({
            type:   parseFormula.TOKEN_AST_NODE,
            value:  postfix[i].value,
            left:   leftHand,
            right:  rightHand
          });

      } else {

        // add to output queue
        out.push( postfix[i] );

      }

    }

    // return the final AST
    if( out.length == 1 ) {
      return out[0];
    } else {
      err( 'buildAST', 'Failed to build AST tree.' );
      return null;
    }

  }



  return buildAST;
});