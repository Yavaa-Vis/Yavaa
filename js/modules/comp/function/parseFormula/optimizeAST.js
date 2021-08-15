"use strict";
/**
 * optimize the AST
 *
 * currently implemented:
 * - constant folding
 *
 */
define( [
         'comp/function/parseFormula/optimize/definition',
         'util/requirePromise',
], function(
         definition,
         requireP
){

  return async function optimizeAST( root ) {

    for( let step of definition ) {

      // determine the order
      let traverse;
      switch( step.order ) {
        case 'pre':   traverse = preOrder;  break;
        case 'post':  traverse = postOrder; break;
        default: throw new Error( `Unknown traversal of AST (${step.order}) - only 'pre' and 'post' allowed.` );
      }

      // load all functions
      const funktions = await Promise.all(
            step.funktions.map( (fktName) => requireP( 'comp/function/parseFormula/optimize/' + fktName ) )
          );

      // walk the AST and apply all functions
      traverse( root, (node) => {
        for( let fkt of funktions ){
          fkt.apply( node );
        }
      });

    }

    return root;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXX Traversing functions XXXXXXXXXXXXXXXXXXXXXXXXX */

  function preOrder( node, cb ) {

    // apply the callback
    cb( node );

    // if there are children, optimize them afterward
    if( 'children' in node ) {
      for( let child of node.children ) {
        postOrder( child, cb );
      }
    }

  }

  function postOrder( node, cb ) {

    // if there are children, optimize them first
    if( 'children' in node ) {
      for( let child of node.children ) {
        preOrder( child, cb );
      }
    }

    // apply the callback
    cb( node );

  }

});