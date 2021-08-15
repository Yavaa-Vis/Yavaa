"use strict";
/**
 * Phase 1 transformation:
 * collect all children of an "add" operation
 *
 *     +                 +
 *    / \              / | \
 *   +           =>
 *  / \
 *
 */
define( [], function(){

  return function collectSummands( node ) {

    // just applies to addition
    if( node.value != '+' ) {
      return node;
    }

    // collect all children of child-additions
    var children = [];
    for( var i=0; i<node.children.length; i++ ) {

      // shortcut
      var child = node.children[i];

      if( child.value == '+' ) {

        // child is an addition itself, so remove the child and collect all its children
        children.push.apply( children, child.children );

      } else {
        children.push( child );
      }
    }

    // if we changed something in the child list, replace the current children
    if( children.length != node.children.length ) {
      node.children = children;
    }

    return node;

  }

});