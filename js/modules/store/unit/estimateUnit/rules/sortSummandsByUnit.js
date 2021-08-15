"use strict";
/*
 * for sums: group operands by unit and add one new node per unit-group
 */
define( [ 'store/unit/estimateUnit/AstNodeWrapper'
], function(
          NodeWrapper
){

  /**
  * @param {Variant}   node    the root of the current sub tree to process
  */
  function sortSummandsByUnit( node ) {

    // get the wrapper associated with this node
    var wrapper = node.getWrapper();

    // just applies to addition with more than two children and not yet processed nodes
    if( (wrapper.getValue() != '+')
        || (wrapper.getChildCount() <= 2)
      ) {
      return node;
    }

    // get all child wrappers
    var childWrappers = wrapper.getChildren();

    // for the rest, separate in groups by unit
    var variantGroups = groupByUnit( childWrappers, node.getUnit() );

    // if we got just one group, use that
    if( variantGroups.length == 1 ) {

      // that group's members are the children of this node
      node.setChildren( variantGroups[0] );

      // check, if this variant has to be converted
      if( !variantGroups[0][0].getUnit().hasEqualCompounds( node.getUnit() ) ) {
        node.isConv( true );
      }

      // we are done
      return node;
    }


    // create a new AST node for each variant group and add to result
    var children = [],
        variant;
    for( var i=0; i<variantGroups.length; i++ ) {

      if( variantGroups[i].length < 2 ) {

        // a single node stays unchanged
        variant = variantGroups[i][0].getWrapper().get( node.getUnit() );

      } else {

        // build variant
        variant = buildNode( variantGroups[i], variantGroups[i][0].getUnit() );

        // make sure the result has the correct unit
        variant = variant.getWrapper().get( node.getUnit() );

      }

      // add to this node's children
      children.push( variant );

    }

    // update the variant's children
    node.setChildren( children );

    return node;

  }


  /**
   * builds a new node for the given variants
   *
   * - create a NodeWrapper object
   * - link the NodeWrapper object to those of the given variants
   * - get a variant of the NodeWrapper
   * - attach all variants as child-nodes
   * - return the variant
   */
  function buildNode( variants, unit ) {

    // get the wrapper objects for all variants
    var childWrappers = [];
    for( var i=0; i<variants.length; i++ ) {
      childWrappers.push( variants[i].getWrapper() );
    }

    // create a new NodeWrapper for these variants
    var wrapper = new NodeWrapper({ 'value': '+', 'type': 1 }, childWrappers );

    // get a variant for the given unit and overwrite the "is converted" flag
    var variant = wrapper.add( unit );

    // add all child variants as children
    variant.setChildren( variants );

    // return the variant
    return variant;
  }


  /**
   * group the given wrappers by unit, with the following restrictions:
   * - the variants in each group should not be converted
   * - there should be as few groups as possible
   *
   * algorithm:
   * - get all unconverted variants of the wrapper
   *   (this does not mean, there are no conversions in the subtree below that variant!)
   * - pick the largest group = chosenGroup
   *   (i.e. the one that covers most child nodes or is the result of the parent)
   * - remove all child nodes already present in chosenGroup from the other groups
   * - if non-empty groups remain, call recursively = result
   * - add chosenGroup to result and return
   *
   */
  function groupByUnit( wrappers, dominant ) {

    // group all (non-converted) variants of all wrappers by unit
    var variantsByUnit = {};
    for( var i=0; i<wrappers.length; i++ ) {

      // get unconverted variants
      var variants = wrappers[i].getAll( true );

      // sort into groups
      for( var j=0; j<variants.length; j++ ) {

        // get hash
        var hash = variants[j].getUnit().getHash();

        // make sure the group exists
        variantsByUnit[ hash ] = variantsByUnit[ hash ] || [];

        // add to group
        variantsByUnit[ hash ].push( variants[j] );

      }
    }

    // get the most important group
    var maxHash, maxCount;
    if( dominant && variantsByUnit[ dominant.getHash() ] ) {

      // if a dominant is given and present, use that
      maxHash = dominant.getHash();

    } else {

      // identify the largest group
      var hashes = Object.keys( variantsByUnit );
      maxHash = hashes[0];
      maxCount = variantsByUnit[ maxHash ].length;
      for( var i=1; i<hashes.length; i++ ) {

        // larger group?
        if( variantsByUnit[ hashes[i] ].length > maxCount ) {
          maxHash = hashes[i];
          maxCount = variantsByUnit[ maxHash ].length;
        }

      }

    }

    // filter for wrappers, that are not represented in the chosen group
    var chosenGroup = variantsByUnit[ maxHash ],
        coveredWrappers = chosenGroup.map( function( node ){
          return node.getWrapper();
        }),
        notCoveredWrappers = wrappers.filter( function( wrapper ){
          return coveredWrappers.indexOf( wrapper ) < 0;
        });

    // if there are unconvered wrappers, process them
    var result;
    if( notCoveredWrappers.length > 0 ) {
      result = groupByUnit( notCoveredWrappers );
    } else {
      result = [];
    }

    // add the max group to the result
    result.push( chosenGroup );

    // return the result
    return result;
  }

  return sortSummandsByUnit;

});