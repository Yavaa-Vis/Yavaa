"use strict";
/**
 * compute the uncovered parts of the given region per column
 * as well as
 * compute the overlap between the given region and the dataset per column
 *
 * given is a region and a dataset covering parts of it
 *
 * output consists of two parts:
 * - a list of columns and their respective ranges, which are not yet covered by the dataset
 * -- an exact match results in an empty array returned for that particular column
 * - a list of filters over the columns of the dataset, which combined describe the overlap
 *
 * input:
 *   region: [ ... columns ],
 *   ds:     [ ... columns ]
 *
 *
 * output:
 * {
 *    remainder:  [ ... [ columns ] ]
 *    filter:     enumFilter | numberFilter
 * }
 *
 * column
 * {
 *    "concept":    String,
 *    "minValue":   Number || null,
 *    "maxValue":   Number || null,
 *    "isMeas":     Boolean,
 *    "colEnums":   [ ... String ] || null,
 *    "order":      Number                    // optional, just for ds-columns
 * }
 *
 * numberFilter
 * {
 *    minValue:     Number,
 *    maxValue:     Number,
 *    effective:    Boolean,        // does the filter have any effect on the dataset?
 *    order:        Number,         // order of the column as specified in the dataset
 * }
 *
 * enumFilter
 * {
 *    values:       [ ... String ]
 *    effective:    Boolean,        // does the filter have any effect on the dataset?
 *    order:        Number,         // order of the column as specified in the dataset
 * }
 *
 */
define( [ 'basic/Constants' ], function( Constants ){

  return function getIntersection( region, ds ) {

    // create a list of reduced columns
    const reducedCols = [],
          filters     = [];
    for( let i=0; i<region.length; i++ ) {

      // shortcuts
      let regionCol   = region[i],
          dsCol       = ds[i],
          reducedCol  = [];

      // unmatched columns can just be copied over and we are done
      // no filter to be applied
      if( !(dsCol instanceof Object) ) {
        reducedCols.push( regionCol );
        filters.push( null );
        continue;
      }

      // clone the original column
      let remainder = cloneColumn( regionCol );

      // switch by type
      if( dsCol.datatype == Constants.DATATYPE.SEMANTIC ) {

        // enumeration

        // init empty filter object
        const filter = {
            values:     [],
            order:      dsCol.order,
            effective:  null
        };
        filters.push( filter );

        // create new reduced column and the respective filter
        if ( (regionCol.colEnums != null) && (regionCol.colEnums.length > 0) ) {

          // bounded region
          // remainder contains region enums that are not covered by the dataset

          if( regionCol.negate ) {

            // region is somewhat unbounded, but might remove some values from the dataset
            filter.values       = dsCol.colEnums.filter( (el) => !regionCol.colEnums.includes( el ) );
            remainder.colEnums  = regionCol.colEnums.concat( filter.values );

          } else {

            // actually bounded region

            remainder.colEnums = [];

            // region col gives us the values to filter by
            regionCol.colEnums
              .forEach( (el) => {

                if( dsCol.colEnums.includes( el )  ) {
                  // is included in overlap => filter
                  filter.values.push( el );
                } else {
                  // not included in overlap => remainder
                  remainder.colEnums.push( el );
                }

              });

          }

        } else {

          // unbounded region
          // remainder is anything but the matched columns
          remainder.colEnums = dsCol.colEnums.slice( 0 );
          remainder.negate   = true;
          filter.values   = dsCol.colEnums.slice( 0 );

        }

        // see if the filter has any effect; both have to be true:
        // - there have to be values in the filter
        // - there have to be some more values in the dataset than in the filter
        filter.effective = (filter.values.length > 0) && (dsCol.totalEnumCount > filter.values.length);

      } else {

        // time / numeric

        // shortcuts
        let regionMinSmaller = (regionCol.minValue == null) || (regionCol.minValue < dsCol.minValue),
            regionMaxSmaller = (regionCol.maxValue != null) && (regionCol.maxValue < dsCol.maxValue);

        // calculate filter/overlap
        let filter = {
            minValue:   regionMinSmaller ? dsCol.minValue : regionCol.minValue,
            maxValue:   regionMaxSmaller ? regionCol.maxValue : dsCol.maxValue,
            order:      dsCol.order,
            effective:  null
        };
        if( filter.minValue > filter.maxValue ) {
          filter.maxValue = filter.minValue;
        }
        filters.push( filter );
        filter.effective = (filter.minValue > dsCol.minValue) || (filter.maxValue < dsCol.maxValue);

        // calculate remainder, only needed, if there is an overlap
        if( filter.minValue != filter.maxValue ) {

          // depending on the relation between region ( |----| ) and dataset ( X++++X )
          switch( true ){

            // |----X++++++X-----|
            case regionMinSmaller && !regionMaxSmaller:
              // left region
              remainder.maxValue = dsCol.minValue;
              addCol( reducedCol, remainder );
              // right region
              remainder = cloneColumn( regionCol );
              remainder.minValue = dsCol.maxValue;
              break;

            // |-----X+++++|+++++X
            case regionMinSmaller && regionMaxSmaller:
              remainder.maxValue = dsCol.minValue;
              break;

            // X+++++|++++X------|
            case !regionMinSmaller && !regionMaxSmaller:
              remainder.minValue = dsCol.maxValue;
              break;

            // X++++|++++|+++X
            case !regionMinSmaller && regionMaxSmaller:
              // placeholder for empty column
              remainder = undefined;
              break;

          }

        }

      }

      // add the newly created column to remainder
      addCol( reducedCol, remainder );

      // collect all column options for remainder
      reducedCols.push( reducedCol );

    }

    // return the combined result
    return {
      remainder:  reducedCols,
      filter:     filters
    };

  };


  /**
   * Shallow clone of a given column object
   * @param   {Object}  col
   * @returns {Object}
   */
  function cloneColumn( col ) {
    const res = {};
    Object.keys( col )
          .forEach( (key) => {
            res[ key ] = col[ key ];
          });
    return res;
  }


  /**
   * add a column to the respective column wrapper
   * wont add a column, if it's range is empty
   *
   * @param colWrapper
   * @param col
   * @returns
   */
  function addCol( colWrapper, col ) {

    // empty columns
    if( !col ) {
      return;
    }

    if( col.colEnums != null ) {

      // codelist column

      // any enumeration value left?
      if( col.colEnums.length < 1 ) {
        return;
      }

    } else {

      // numeric / time colum

      // any range left
      if(    (col.minValue !== null)
          && (col.maxValue !== null)
          && (col.maxValue-col.minValue <= 0) ) {
        return;
      }

    }

    // insert, if we still have a column
    colWrapper.push( col );

  }


});