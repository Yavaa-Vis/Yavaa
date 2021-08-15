"use strict";
/*
 * for sums: limit the count of operands per operation to two again
 */
define( [ 'store/unit/estimateUnit/AstNodeWrapper'
], function(
          NodeWrapper
){

  /**
  * @param {Variant}   node    the root of the current sub tree to process
  */
  function limitToTwoOperands( node ) {

    // get the wrapper associated with this node
    var wrapper = node.getWrapper();

    // just applies to addition with more than two children,
    // which have not been converted (will be separated in the base unit)
    var childCount = node.getChildCount();
    if( (node.getValue() != '+')
        || ((childCount !== null) && (childCount <= 2))
        || node.isConv()
      ) {
      return node;
    }

    // convert to binary (sub)tree
    var newNode = buildNode( node.getChildren() );
    node.setChildren( newNode.getChildren() )

    // return resulting node
    return node;

  }


  /**
   * separate the given list of nodes into a binary tree
   */
  function buildNode( nodes ) {

    switch( nodes.length ) {

      case 1: // single node does not have to be separated
              return nodes[0];

      case 2: // if we are down to two, create a new node for the addition of them

              // call recursively for both groups
              var left  = nodes[0],
                  right = nodes[1];

              break;

      default: // more than two nodes, split into two groups and use divide an conquer

              // mid index to separate into two groups
              var midIndex = Math.ceil( nodes.length / 2 );

              // call recursively for both groups
              var left  = buildNode( nodes.slice( 0, midIndex ) ),
                  right = buildNode( nodes.slice( midIndex ) );

    }

    // create new wrapper
    var wrapper = new NodeWrapper({ 'value': '+', 'type': 1 }, [ left.getWrapper(), right.getWrapper() ] );

    // add new variant
    var variant = wrapper.add( left.getUnit() );
    variant.setChildren( [ left, right ] );

    return variant;

  }

  return limitToTwoOperands;

});