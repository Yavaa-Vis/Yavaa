"use strict";
/*
 * classify the combination of two datasets
 * A augmenting B
 *
 * possible cases:
 * J1 (Equi Join):   (dimA = dimB) ⋀ (∃ measA ∉ colB) ⋀ (dimValA = dimValB | A)
 * J2                (dimA ⊂    dimB) ⋀ (∃ measA ∉ colB) ⋀ (dimValA = dimValB | A)
 * U  (Union):       (colA = colB) ⋀ (dimValA ≠ dimValB | A)
 * J3 (Outer Join):  (dimA = dimB) ⋀ (∃ measA ∉ colB) ⋀ (dimValA ⊂  dimValB | A)
 * J4                (∃ dimA ∈ colB) ⋀ (∃ dimA ∉ colB) ⋀ (∃ measA ∉ colB)
 * J5 (Full Outer):  (dimA = dimB) ⋀ (∃ measA ∉ colB) ⋀ (dimValA ⊂  dimValB | A)
 * D  (Drop):        else (== do not want to combine)
 *
 * whereby
 *
 * colx ... columns present in dataset x
 * dimx ... dimension columns present in dataset x
 * valx ... values present in the dimension columns of dataset x
 * valx | y ... values present in the columns of dataset x, which are dimension columns in y
 *
 *
 * input:
 *  dataset, dataset
 *
 * output:
 *  String from Constants.WEIGHT keys
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
 * notes:
 * * column lists are expected to contain no null values!
 */
define( [     'basic/Constants',
], function(  Constants
){

  /**
   *
   * @param   {Object}  ds1   dataset
   * @param   {Object}  ds2   dataset
   * @returns {String}        classification according to above scheme
   */
  function classifyCombination( ds1, ds2 ) {

    // which columns of ds1 are present in ds2
    const commonCol = ds1
                      .columns
                      .filter( (col1) => {
                        // does this column exist in the other dataset
                        return ds2.columns.findIndex( (col2) => col1.concept == col2.concept ) > -1;
                      });

    // which dimensions of ds1 are present in ds2
    const commonDim = commonCol.filter( (col1) => col1.role == Constants.ROLE.DIM );

    // dimensions of ds1 and ds2
    const dim1 = ds1.columns.filter( (col1) => col1.role == Constants.ROLE.DIM ),
          dim2 = ds2.columns.filter( (col2) => col2.role == Constants.ROLE.DIM );

    // measurements of ds1 and ds2
    const meas1 = ds1.columns.filter( (col1) => col1.role == Constants.ROLE.MEAS ),
          meas2 = ds2.columns.filter( (col2) => col2.role == Constants.ROLE.MEAS );

    // check common dimensions' values
    let  dimValContain = true   // dimVal_A ⊂  dimVal_(B|A)
       , dimValEqual   = true   // dimVal_A = dimVal_(B|A)
       , dimValOverlap = true   // dimVal_A ∩ dimVal_B != ∅
    // process all columns both have in common
    for( const col1 of commonDim ) {

      // values for this column
      const range1 = col1.usedRange;

      // get corresponding column
      const col2    = ds2.columns.find( (col2) => col1.concept == col2.concept ),
            range2  = col2.usedRange;

      // compare
      let contain, equal, overlap;
      if( range1 instanceof Array ) {

        // codelists

        // compare contents
        contain = range1.every( (val1) => range2.includes( val1 ) );
        equal   = contain && (range1.length == range2.length);
        overlap = contain || ( range1.some( (val1) => range2.includes( val1 ) )
                            && range2.some( (val2) => range1.includes( val2 ) ) );

      } else {

        // numerics

        // compare
        contain =    (range1.minValue >= range2.minValue) && (range1.minValue <= range2.maxValue)
                  && (range1.maxValue >= range2.minValue) && (range1.maxValue <= range2.maxValue);
        equal   = (+range1.minValue == +range2.minValue) && (+range1.maxValue == +range2.maxValue);
        overlap = contain ||
                    (   ( (range1.minValue >= range2.minValue) && (range1.minValue <= range2.maxValue) )
                     || ( (range1.maxValue >= range2.minValue) && (range1.maxValue <= range2.maxValue) ) );

      }

      // adjust the globals
      dimValContain = dimValContain && contain;
      dimValEqual   = dimValEqual   && equal;
      dimValOverlap = dimValOverlap && overlap;

    }

    // shortcuts
    // d ... dimension-columns
    // m ... measurement-columns
    // v ... dimension-values
    const dOverlap  = (commonDim.length > 0),
          dContain  = dOverlap && dim1.every( (d1) => commonCol.includes( d1 ) ),
          dEqual    = dContain && (dim1.length == dim2.length),
          dSeparate = !dOverlap,
          mOverlap  = meas1.some( (m1) => commonCol.includes( m1 ) ),
          mContain  = mOverlap && meas1.every( (m1) => commonCol.includes( m1 ) ),
          mEqual    = mContain && (meas1.length == meas2.length),
          mSeparate = !mOverlap,
          vOverlap  = dimValOverlap,
          vContain  = dimValContain,
          vEqual    = dimValEqual,
          vSeparate = !vOverlap;

    // result table
    // some scenarios should not appear here as they are prevented by previous steps
    switch( true ) {

      // we need some dimensions to go on
      case  dSeparate:                                return { type: 'D', weight: Number.MAX_VALUE };

      // full match with a new measurement
      case dEqual     &&  mSeparate   &&  vEqual:     return createJoin( 1, ds1, ds2, commonDim );

      // partial col match with a new measurement
      case dContain   &&  mSeparate   &&  vEqual:     return createJoin( 2, ds1, ds2, commonDim );

      // union
      case dEqual     &&  mEqual      &&  vSeparate:  return createUnion( 3, ds1, ds2, commonCol );

      // partial val match with a new measurement
      case dEqual     &&  mSeparate   &&  vContain:   return createJoin( 4, ds1, ds2, commonDim );

      // partial dim and val match with new measurement
      case dOverlap   &&  mSeparate   &&  vContain:   return createJoin( 5, ds1, ds2, commonDim );

      // (full outer join) overlapping val match with a new measurement
      case dEqual     &&  mSeparate   &&  vOverlap:   return createJoin( 6, ds1, ds2, commonDim );

      // (full outer join) overlapping dim and val match with new measurement
      case dOverlap   &&  mSeparate   &&  vOverlap:   return createJoin( 7, ds1, ds2, commonDim );

      // nothing applied
      default:                                        return { type: 'D', weight: Number.MAX_VALUE };

    }

  }


  /**
   * create the join output for the given values
   * also returns the join conditions
   *
   * @param   {String}    weight      weight/priority of this operation
   * @param   {Object}    ds1         dataset one
   * @param   {Object}    ds2         dataset two
   * @param   {Array}     commonDim   list of shared dimension columns
   * @returns {Object}
   */
  function createJoin( weight, ds1, ds2, commonDim ) {

    // convert common columns to indices in the respective datasets
    let   commonDimInd1 = commonDim.map( (col) => ds1.columns.findIndex( (c1) => col.concept == c1.concept ) )
        , commonDimInd2 = commonDim.map( (col) => ds2.columns.findIndex( (c2) => col.concept == c2.concept ) );

    // combine both lists to the join condition
    let joinCond = [];
    for( let i=0; i<commonDimInd1.length; i++ ){
      joinCond.push( [ commonDimInd1[i], commonDimInd2[i] ] );
    }

    // now we have all data
    return {
      type:   'J',
      weight: weight,
      cond:   joinCond
    };

  }

  /**
   * create the union output for the given values
   * also returns the join conditions
   *
   * @param   {String}    weight      weight/priority of this operation
   * @param   {Object}    ds1         dataset one
   * @param   {Object}    ds2         dataset two
   * @param   {Array}     commonDim   list of shared dimension columns
   * @returns {Object}
   */
  function createUnion( weight, ds1, ds2, commonCol ) {

    // convert common columns to indices in the respective datasets
    let   commonColInd1 = commonCol.map( (col) => ds1.columns.findIndex( (c1) => col.concept == c1.concept ) )
        , commonColInd2 = commonCol.map( (col) => ds2.columns.findIndex( (c2) => col.concept == c2.concept ) );

    // combine both lists to the join condition
    let unionCond = [];
    for( let i=0; i<commonColInd1.length; i++ ){
      unionCond.push( [ commonColInd1[i], commonColInd2[i] ] );
    }

    // now we have all data
    return {
      type:   'U',
      weight: weight,
      cond:   unionCond
    };

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

  return classifyCombination;

});