"use strict";
/*
 * given a list of datasets, find a series of JOINs and UNIONs for that datasets to combine them into one
 * output is a binary tree describing the combination path
 *
 * input:
 * [ ... dataset ]
 *
 * output:
 * pwfNode
 *
 *
 * dataset:
 * {
 *    ds:           String,         // dataset id
 *    aggColumns:   [ Number ],     // array of column ids, that need to be eliminated
 *    columns: [ ... {              // columns describing this dataset
 *      concept:    String,           // concept covered
 *      type:       String,           // measurement vs dimension
 *      usedRanged: Mixed,            // array of values or min/max-value covered by this column
 *    }]
 * }
 *
 * pwfNode:
 * Number || dataset || innerPwfNode    // number refers to the position of the dataset within the input;
 *                                      // dataset is just used internally here
 *
 * innerPwfNode
 * {
 *    op1:  pwfNode,      // first operand
 *    op2:  pwfNode,      // second operand
 *    op:   String,       // operation: JOIN, UNION
 *
 *    // internally
 *    columns: column     // columns/values covered after this operation
 * }
 *
 */
define( [     'util/Heap',
              'basic/Constants',
              'search/searchByCombination/createPseudoworkflow/classifyCombination'
], function(  Heap,
              Constants,
              classifyCombination
){

  /*
   * entry function
   */
  function createPseudoworkflow( datasets ) {

    // clone dataset list for internal use
    // datasets, that have columns to aggregate are replaced by virtual ones, where the aggregation has already been performed
    // for all entries in datasets, the indexes remain the same
    const nodes = datasets.map( (ds) => {

      // copy dataset
      ds = JSON.parse( JSON.stringify( ds ) );

      // see, if there is a need to replace
      if( ('aggColumns' in ds) && (ds.aggColumns.length > 0 ) ) {

        // set aggregated columns to null
        ds.aggColumns
          .forEach( (colInd) => {

            // find the respective index
            let index = ds.columns.findIndex( (col) => col && (col.order == colInd) );

            // remove columns
            ds.columns[ index ] = null;

          });

      }

      // remove null values from column list
      ds.columns = ds.columns.filter( (col) => col );

      // return
      return ds;

    });

    // init state variables
    let heap = new Heap( false )            // organize partial results
        , bestMatchCount = 1                // current maximum amount of covered datasets
        , bestMatch = nodes.slice(0);       // set of nodes matching the current maximum count

    // fill the heap initially
    for( let i=0; i<nodes.length; i++ ) {
      for( let j=i+1; j<nodes.length; j++ ) {

        // create entry
        const entry = createPwfEntry( nodes[i], nodes[j] );

        // if there was a possible combination
        if( entry ) {

          // add entry to heap
          heap.insert( entry.weight, entry );

        }

      }
    }

    // process each combination from the heap
    let comb;
    while( (comb = heap.extract()) != null ) {

      // if all datasets are covered, we are done
      if( datasets.length == comb.includedDs.length ) {
        return postProcess( nodes, comb );
      }

      // update best matches, if possible
      if( comb.includedDs.length > bestMatchCount ) {

        // new highest score
        bestMatchCount = comb.includedDs.length;
        bestMatch = [ comb ];

      } else if( comb.includedDs.size == bestMatchCount ) {

        // another entry in best score
        bestMatch.push( comb );

      }

      // match to other datasets, we already have
      for( let i=0; i<nodes.length; i++ ) {

        // create entry
        const entry = createPwfEntry( nodes[i], comb );

        // if there was a possible combination
        if( entry ) {

          // add entry to heap
          heap.insert( entry.weight, entry );

        }

      }

    } // end while( (comb = heap.extract()) != null )

    // if we came this far, we have to choose from our current topscore list
    // we did not find a combination, which covered all datasets
    return postProcess( nodes, bestMatch[0] );

  };


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX HELPER XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * cleanse the resulting pseudo workflow
   * * remove unnecessary properties
   * * replace datasets by ids
   *
   * @param     {Array}   datasets      the transformed input dataset list of createPseudoworkflow()
   * @param     {Object}  pwf           the calculated pseudo workflow of createPseudoworkflow()
   * @returns   {Object}                cleansed pseudo workflow
   */
  function postProcess( datasets, pwf ) {

    // node is a blank dataset, so we can return the respective number
    if( 'ds' in pwf ) {
      return datasets.indexOf( pwf );
    }

    // it is a real pwf node, so remove all unnecessary properties
    [ 'columns', 'weight', 'includedDs' ]
      .forEach( (key) => delete pwf[ key ] );

    // call recursively for both operands
    pwf.op1 = postProcess( datasets, pwf.op1 );
    pwf.op2 = postProcess( datasets, pwf.op2 );

    // done
    return pwf;

  }

  /**
   * create a pseudoworkflow-entry for the given two datasets/pwfEntries, if possible
   *
   * @param   {Object}        ds1     dataset or pseudoworkflow-entry
   * @param   {Object}        ds2     dataset or pseudoworkflow-entry
   * @returns {Object|null}           the resulting pseudoworkflow-entry or null, if none is possible
   */
  function createPwfEntry( ds1, ds2 ) {

    // filter out combinations with overlap
    let includedDs1 = ( 'includedDs' in ds1 ) ? ds1.includedDs : [ ds1 ],
        includedDs2 = ( 'includedDs' in ds2 ) ? ds2.includedDs : [ ds2 ],
        overlapping = includedDs1.some( (ds) => includedDs2.includes( ds ) );
    if( overlapping ) {
      return null;
    }

    // classify both directions
    let class12 = classifyCombination( ds1, ds2 ),
        class21 = classifyCombination( ds2, ds1 );

    // we don't add the drop variants
    if( (class12.type == 'D') && (class12.type == class21.type) ) {
      return null;
    }

    // take the more advantageous combination
    let op1, op2, op, weight, cond;
    if( class21.weight < class12.weight ) {

      // add ds2-ds1 combination
      op1 = ds2;
      op2 = ds1;
      op  = class21.type;
      weight = class21.weight;
      cond = class21.cond;

    } else {

      // add ds1-ds2 combination
      op1 = ds1;
      op2 = ds2;
      op  = class12.type;
      weight = class12.weight;
      cond = class12.cond;

    }

    // get set of resulting columns
    let cols;
    switch( op ) {

      // UNION
      case 'U':   cols = colUnion( op1.columns, op2.columns ); break;

      // JOIN
      case 'J':   cols = colJoin( op1.columns, op2.columns ); break;

      // everything else leads to an error here
      default: throw new Error( 'Unknown operation "' + op + '"!' );

    }

    // create list of included datasets
    let includedDs = includedDs1.concat( includedDs2 );

    // create entry
    return {
      op1:      op1,
      op2:      op2,
      op:       op,
      columns:  cols,
      weight:   weight,
      includedDs: includedDs,
      cond:     cond
    };

  }

  /**
   * compute the UNION of two column sets
   * @param    {Array}    col1      left hand side dataset
   * @param    {Array}    col2      right hand side dataset
   * @returns  {Array]              list of columns and values after union
   */
  function colUnion( col1, col2 ) {
    // result will have the same list of columns, but values will have changes

    // copy columns from first dataset
    let cols = col1.map( (c) => {

      // skip null entries
      if( c == null ) { return c; }

      // copy the important values
      return {
        datatype:   c.datatype,
        concept:    c.concept,
        role:       c.role,
        usedRange:  (c.usedRange instanceof Array)
                      ? c.usedRange.slice( 0 )
                      : { minValue: c.usedRange.minValue, maxValue: c.usedRange.maxValue }
      };
    });

    // for each column in col2 add the values to col1
    col2.forEach( (c) => {

      // find corresponding column
      let corCol = cols.find( (corCol) => corCol.concept == c.concept );

      // adjust values
      if( c.usedRange instanceof Array ) {

        // just take unique entries
        corCol.usedRange = [ ... new Set( corCol.usedRange.concat( c.usedRange ) ) ];

      } else {

        // extend range
        if( c.datatype == Constants.DATATYPE.TIME ) {

          corCol.usedRange.minValue = corCol.usedRange.minValue < c.usedRange.minValue
                                        ? corCol.usedRange.minValue : c.usedRange.minValue;
          corCol.usedRange.maxValue = corCol.usedRange.maxValue > c.usedRange.maxValue
                                        ? corCol.usedRange.maxValue : c.usedRange.maxValue;
        } else {
          corCol.usedRange.minValue = Math.min( corCol.usedRange.minValue, c.usedRange.minValue );
          corCol.usedRange.maxValue = Math.max( corCol.usedRange.maxValue, c.usedRange.maxValue );
        }

      }

    });

    // return final list of columns
    return cols;

  }

  /**
   * compute the JOIN of two column sets
   * @param    {Array}    col1      left hand side dataset
   * @param    {Array}    col2      rigth hand side dataset
   * @returns  {Array]              list of columns and values after join
   */
  function colJoin( col1, col2 ) {
    // result will be the superset of both column lists

    // copy columns from first dataset
    let cols = col1.map( (c) => {

      // skip null entries
      if( c == null ) { return c; }

      // copy the important values
      return {
        concept:    c.concept,
        role:       c.role,
        usedRange:  (c.usedRange instanceof Array)
                      ? c.usedRange.slice( 0 )
                      : { minValue: c.usedRange.minValue, maxValue: c.usedRange.maxValue }
      };
    });

    // copy missing columns from second dataset
    col2.forEach( (c) => {

      // skip null entries
      if( c == null ) { return c; }

      // find corresponding column
      let corCol = cols.find( (corCol) => corCol.concept == c.concept );


      if( corCol ) {

        // if existing, make sure it is now a dimension

        corCol.role = Constants.ROLE.DIM;

      } else {

        // add, if missing

        cols.push({
          concept:    c.concept,
          role:       c.role,
          usedRange:  (c.usedRange instanceof Array)
                        ? c.usedRange.slice( 0 )
                        : { minValue: c.usedRange.minValue, maxValue: c.usedRange.maxValue }
        })
      }
    });

    // return final list of columns
    return cols;

  }


  /**
   * serialize the PWF node to a human readable output
   * used for debugging
   *
   * @param     node
   * @return  {String}
   */
  function serializePwfNode( node ) {

    if( 'ds' in node ) {

      // plain dataset
      return node.ds;

    } else {

      return JSON.stringify({
        op1: serializePwfNode( node.op1 ),
        op2: serializePwfNode( node.op2 ),
        op: node.op
      });

    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX EXPORT XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  return createPseudoworkflow;

});