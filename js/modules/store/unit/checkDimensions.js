"use strict";
/**
 * check the given AST for correctness of dimension using the given binding of variable units
 *
 * in the process all nodes get attached with a dimVector property
 */
define( [
          'basic/error',
          'comp/function/parseFormula/Constants'
], function(
          err,
          pConst
){


  function checkDimension( root, bindings, mode ) {

    // build a postfix ordering of the nodes in the AST
    var stack = [ root ],
        postfix = [],
        node;
    while( stack.length > 0 ) {

      // get the next node to process
      node = stack.pop();

      // add itself to the result
      postfix.push( node );

      // if it has children, schedule those to be processed
      if( 'children' in node ) {
        for( var i=0; i<node.children.length; i++ ) {
          stack.push( node.children[i] );
        }
      }
    }

    // for all nodes, determine the dimension-vector and check for incompatibilities
    for( var i=postfix.length-1; i>=0; i-- ) {

      // TODO take care of constants etc

      // we just have to do something for inner nodes
      switch( postfix[i].type ) {

        /* --------------------------- TOKEN_OP ---------------------------- */
        // inner nodes: operators
        case pConst.TOKEN_OP:

          // get the dimension-vector for the left and the right operand
          var left  = postfix[i].children[0],
              right = postfix[i].children[1];

          switch( postfix[i].value ) {

            // addition and subtraction: dimensions have to be the same for
            case '+':
            case '-':
              for( var j=0; j<left.dimVector.length; j++ ) {
                if( right.dimVector[j] != left.dimVector[j] ) {
                  err( 'checkDimension', 'Incompatible dimensions: ' + left.dimVector + ' ' + postfix[i].value + ' ' + right.dimVector );
                  return null;
                }
              }
              postfix[i].dimVector = left.dimVector;
              break;

            // for multiplication, we add the dim vectors
            case '*':
              postfix[i].dimVector = [];
              for( var j=0; j<left.dimVector.length; j++ ) {
                postfix[i].dimVector.push( left.dimVector[j] + right.dimVector[j] );
              }
              break;

            // for division, we subtract the dim vectors
            case '/':
              postfix[i].dimVector = [];
              for( var j=0; j<left.dimVector.length; j++ ) {
                postfix[i].dimVector.push( left.dimVector[j] - right.dimVector[j] );
              }
              break;

            // unknowns
            default: err( 'checkDimension', 'Unknown operand: ' + postfix[i].value );
               return null;
          }
          break;

        /* ------------------------ TOKEN_VARIABLE ------------------------- */
        // leaf nodes: variables
        case pConst.TOKEN_VARIABLE:

          // get the dimension vector from the unit
          postfix[i].dimVector = bindings[ postfix[i].value ].getDimVector();
          break;

      }


    }

    return true;

  }


  return checkDimension;

});