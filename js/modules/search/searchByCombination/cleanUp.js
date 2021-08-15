"use strict";
/**
 * remove entries from dataset list, that were not used within the pseudoworkflow
 * also adjust indexes in pseudoworkflow after removal
 */
define( [], function(){

  return function cleanUp( dsList, pwf ) {

    // shortcircuit empty results
    if( pwf === null ) {
      return{
        pwf: null,
        datasets: [],
      }
    }

    // first pass pwf: get all used datasets
    let usedDs = new Set();
    traverse( pwf, (node) => {
      (typeof node == 'number') && usedDs.add( node );
    });

    // filter datasets for used datasets
    let newDsList = dsList.filter( (ds, ind) => usedDs.has( ind ) );

    // create mapping
    let dsMap = {};
    newDsList
      .forEach( (ds, newInd) => {

        // get old index
        let oldInd = dsList.indexOf( ds );

        // add to map
        dsMap[ oldInd ] = newInd;

      });

    // second pass pwf: replace old dataset indexes by new ones
    if( typeof pwf == 'number' ) {

      // workflow is just a single dataset
      pwf = dsMap[ pwf ];

    } else {

      // workflow consists of nodes, that can be traversed
      traverse( pwf, (node) => {
        if( typeof node == 'object' ) {
          (typeof node.op1 == 'number') && (node.op1 = dsMap[ node.op1 ]);
          (typeof node.op2 == 'number') && (node.op2 = dsMap[ node.op2 ]);
        }
      });

    }

    // return newly created dataset list
    return {
      datasets: newDsList,
      pwf: pwf
    };

  };


  /**
   * traverse the given pseudoworkflow and apply the callback to each node
   * preorder
   *
   * @param     {Object}    node      the root of the current (sub)tree
   * @param     {Function}  cb        callback to be applied
   */
  function traverse( node, cb ) {

    // apply callback
    cb( node );

    // recursive calls
    if( typeof node == 'object' ) {
      traverse( node.op1, cb );
      traverse( node.op2, cb );
    }

  }

});