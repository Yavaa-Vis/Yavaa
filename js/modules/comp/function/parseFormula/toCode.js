"use strict";
/**
 * convert the given AST to actual code
 * if any input variable is null, the output will be null as well
 */
define( [
         'basic/error',
         'comp/function/parseFormula/Constants'
], function(
         err,
         pConst
){

  /**
   * converts the formula given as AST into a JavaScript code sequence
   * @param   {!Object}   root   the root node of the AST
   * @return  {String}           the respective JS code
   */
  function toCode( root ) {

    // used variables
    var out = [],
        constants = new Set(), variables = new Set(), funktions = new Set(),
        i, leftHand, rightHand, operand;

    // walk through the graph until the root note has a "toCode" property attached
    var node = root;
    while( ('parent' in node) || !('toCode' in node) ){

      // if we are done with the current node, proceed with the parent
      if( 'toCode' in node ) {
        node = node.parent;
      }

      // do something based on current node type
      switch( node.type ) {

        // number
        case pConst.TOKEN_NUMBER:
          // add entry to constants, if not already there
          constants.add( node.value );
          // add code
          node.toCode = "constants['" + node.value + "']";
          break;

        // variable
        case pConst.TOKEN_VARIABLE:
          // add to output queue
          variables.add( node.value );
          // add code
          node.toCode = `values['${node.value}']`;
          break;

        // operator
        case pConst.TOKEN_OP:
          // we need at least two values on the output queue
          if( !('children' in node) || (node.children.length < 2) ) {
            err( 'parseFormula.toCode', 'Missing operators for operand: ' + node.value );
            return null;
          }

          // get both operands
          leftHand  = node.children[0];
          rightHand = node.children[1];

          // are the operands already processed?
          if( !('toCode' in leftHand ) ) {
            node = leftHand;
            continue;
          }
          if( !('toCode' in rightHand ) ) {
            node = rightHand;
            continue;
          }

          // choose the correct operand-function
          switch( node.value ) {
            case '+': operand = 'add'; break;
            case '-': operand = 'sub'; break;
            case '*': operand = 'mul'; break;
            case '/': operand = 'div'; break;
            default: err( 'parseFormula.toCode', 'Unknown operand: ' + node.value );
                 return null;
          }

          // if leftHand is not a term, we have to add `clone()`
          if( leftHand.type !== pConst.TOKEN_AST_NODE ) {
            operand = 'clone().' + operand;
          }

          // add code
          node.toCode = leftHand.toCode + '.' + operand + '(' + rightHand.toCode + ')';

          // code for children is not needed anymore
          delete leftHand.toCode;
          delete rightHand.toCode;

          break;
      }

    }

    // if any variable is null, the result will be null
    // recall there is just one global null value; so we can just return the respective value
    const code = [];
    variables
          .forEach( (variable) => {
            code.push( `if( values['${variable}'].isNull ) { return values['${variable}']; }` );
          });

    // add the function code
    code.push( 'return ' + root.toCode );
    delete root.toCode;

    return {
      'funktion':  code.join(''),
      'constants': [ ... constants ],
      'values':    [ ... variables ],
      'funktions': [ ... funktions ],
    };
  }

  return toCode;

});