"use strict";
/**
 * compact and enhance the results by
 * - remove properties, that are not needed anymore
 * - remove ineffective filters
 * - calculate coverages for each column
 * - calculate result coverage per component (== dataset)
 *
 * output
 * [ ... entry ]
 *
 * entry
 * {
 *    ds:       String,               // the URI of the dataset
 *    dsPublisher: String,            // URI for publisher of this dataset
 *    filter:   { <order>: filter },  // filter to be applied; key is the order in the respective dataset
 *    columns:  [ ... columns ],      // list of all columns in the dataset
 *    aggColumns: [ ... Number ],     // list of column numbers in the datset, that need removed by aggregation
 *    resultOrder { Number: Number }, // mapping from column number in dataset to column number in result
 *    coverage: Number                // coverage from this ds towards the whole result
 * }
 *
 * columns
 * {
 *    concept:  String,               // URI to the concept covered
 *    datatype: String,               // type of this column: "semantic", "numeric", "time"
 *    order:    Number,               // column index
 *    type:     String,               // dimension or measurement
 *    usedRange: Set || {             // range of the column, that contributes to the result
 *      minValue: Number || Date,
 *      maxValue: Number || Date
 *    },
 *    coverage: Number,               // coverage of this column towards the whole result
 * }
 */
define( [ 'store/metadata' ], function( MetaStore ){
  return async function compactResults( region, res ) {

    // collect (distinct) involved datasets
    const datasets = new Set( res.map( (entry) => entry.cand.ds ) );

    // retrieve meta and column data for all involved datasets
    const [ metadata, columns ] = await Promise.all([
                                    MetaStore.getMetadata( [ ... datasets ] ),
                                    MetaStore.getColumns( [ ... datasets ] ),
                                  ]);

    // remove duplicates and containments from component list
    res = removeDuplicates( res );

    // rework list of components
    const components = res
            .map( (entry) => {

              // shortcut
              const dsId = entry.cand.ds;

              // which columns need to be grouped by?
              // == columns present in the dataset, but not in the exported candidate
              const dsCols = columns[ dsId ]
                                .map( (col) => col ? col.order : null )
                                .filter( (col) => col );
              const aggColumns = new Set( dsCols );
              entry
                .cand
                .covers
                .forEach( (col) => {
                  if( col ) {
                    aggColumns.delete( col.order );
                  }
                });

              // create a map from column order in dataset to column order in result
              const resultOrder = {};
              entry
                .cand
                .covers
                .forEach( (col, ind) => {
                  if( col ) {
                    resultOrder[ col.order ] = ind;
                  }
                });

              // create list of filter per (dataset) column index
              const filter = {};
              entry
                .filter
                .forEach( (f) => {
                  if ( f && f.effective ){
                    filter[ f.order ] =  f;
                  }
                });

              // just take the values, we need further on
              return {
                  source:       entry,
                  ds:           dsId,
                  dsPublisher:  metadata[ dsId ][ 'http://purl.org/dc/terms/publisher' ][ 0 ],
                  filter:       filter,
                  columns:      columns[ dsId ],
                  aggColumns:   [ ... aggColumns ],
                  resultOrder:  resultOrder,
              };

            });

    // estimate the size of the resulting dataset
    /*
     * for codelist-columns, we need to gather the values, which will be present in the resulting dataset
     * if the filter is set, we can use those values
     * if not, we have to query the metastore for this information
     */

    // gather 1st stage size information
    const resultSize  = {},               // collect the sizes for each column; float for numeric/time, Set for codelists
          codelists2Retrieve = {};        // map between codelist and the value-set it points to; value-sets in final dataset and NOT in components!

    // get the size of the resulting dataset per column
    components
      .forEach( (ds) => {

        ds.columns
          .forEach( (coverCol) => {

            // skip columns, that are not present in the result
            if( !(coverCol.order in ds.resultOrder) ) {
              return;
            }

            // shortcuts
            let dsColIndex = coverCol.order,
                resColIndex = ds.resultOrder[ dsColIndex ];

            // for codelist columns, that are present in the result, we need some more information
            if( 'codelist' in coverCol ) {

              // codelists

              // init collection of values for this column
              resultSize[ resColIndex ] = resultSize[ resColIndex ] ||
                                          {
                                            values:   new Set(),
                                            concept:  coverCol.concept,
                                            datatype: coverCol.datatype,
                                          };
              const resultCol = resultSize[ resColIndex ].values;

              // do we already know, which values to take?
              if( ds.filter[ dsColIndex ] && ds.filter[ dsColIndex ].effective ) {

                // add all values from filter to respective result column's values
                ds
                  .filter[ dsColIndex ]
                  .values
                  .forEach( (el) => resultCol.add( el ) );

              } else {

                // we still need to know, what values come from this

                // queue this codelist for information gathering and point towards the collecting set
                codelists2Retrieve[ coverCol.codelist ] = resultCol;

              }

            } else {

              // times and numeric

              // init column, if needed
              resultSize[ resColIndex ] = resultSize[ resColIndex ] ||
                                          {
                                            minValue: Number.MAX_VALUE,
                                            maxValue: Number.MIN_VALUE,
                                            concept:  coverCol.concept,
                                            datatype: coverCol.datatype
                                          };
              const resultCol = resultSize[ resColIndex ];

              // get range for this column
              let sourceCol;
              // is there filter information?
              if( ds.filter[ dsColIndex ] ) {

                // by using filter
                sourceCol = ds.filter[ dsColIndex ];

              } else {

                // by using column range from the original result
                sourceCol = ds.source.cand.covers[ resColIndex ];

              }

              // attach min/max to column
              coverCol.usedRange = { minValue: sourceCol.minValue, maxValue: sourceCol.maxValue };

              // adjust range for resultSize column
              resultCol.minValue = Math.min( resultCol.minValue, coverCol.usedRange.minValue );
              resultCol.maxValue = Math.max( resultCol.maxValue, coverCol.usedRange.maxValue );

            }

          }); // end forEach ds.columns

      }); // end forEach components

    // get values for remaining codelists
    const codelists = Object.keys( codelists2Retrieve );
    let codelistsValues;  // store values per codelist
    if( codelists.length > 0 ) {

      // retrieve codelist values
      codelistsValues = await MetaStore.getCodelistValues( codelists );

      // add the respective values
      Object.keys( codelistsValues )
        .forEach( (codelist) => {

          codelistsValues[ codelist ]
            .forEach( (value) => codelists2Retrieve[ codelist ].add( value ) );

        });

    }

    // calculate contribution of datasets to result
    components.forEach( (ds) => {

      // calculate coverage per column
      ds.columns
        .forEach( (col) => {

          // skip columns not present in result
          if( !(col.order in ds.resultOrder) ){
            return;
          }

          // get respective result column
          const resultCol = resultSize[ ds.resultOrder[ col.order ] ];

          // calculate coverage for this column
          let cov;
          if( 'values' in resultCol ) {

            // get values from this column
            let values;
            if( ds.filter[ col.order ] ) {
              values = ds.filter[ col.order ].values
            } else {
              values = codelistsValues[ col.codelist ];
            }

            // store range at column
            col.usedRange = [ ... values ];

            // get coverage
            cov = col.usedRange.length / resultCol.values.size;

          } else {

            // we can directly compute the coverage
            cov = (col.usedRange.maxValue - col.usedRange.minValue) / (resultCol.maxValue - resultCol.minValue);

          }

          // attach to column
          col.coverage = cov;

        });

      // calculate overall coverage
      ds.coverage = ds.columns.reduce( (total, col) => {

        // has to have a coverage (== is part of the result)
        if( col.coverage ) {
          return total * col.coverage;
        } else {
          return total;
        }

      }, 1 );
      ds.coverage = ds.coverage * ( Object.keys( ds.resultOrder ).length / region.length );

    });

    // TODO
    // make them add up to 100%
    // http://www.ams.org/samplings/feature-column/fcarc-apportionii1

    // remove source as we do not need it anymore
    components.forEach( (ds) => { delete ds.source; } );

    // return the results
    return {
      components,
      result:     resultSize
    };

  };


  /**
   * there might me duplicate entries in the component list
   * we remove them here to speed up further computations
   * @param    {Array}    components      list of components
   * @returns  {Array}                    list of deduplicated components
   */
  function removeDuplicates( res ) {

    // group by dataset
    const grouped = res.reduce( (all,el) => {
      all[ el.cand.ds ] = all[ el.cand.ds ] || [];
      all[ el.cand.ds ].push( el );
      return all;
    }, {} );

    // process for each dataset individually
    const result = [];
    for( const collection of Object.values( grouped ) ) {

      // just one entry, so nothing to do
      if( collection.length == 1 ) {
        result.push( collection[0] );
        continue;
      }

      // extract unique entries
      const unique = [];
      for( const entry of collection ) {

        // see, if we find a duplicate
        const isDuplicate = unique.some( (u) => isDuplicateFilter( u.filter, entry.filter ) );

        // only add new uniques
        if( !isDuplicate ) {
          unique.push( entry );
          result.push( entry );
        }

      }

    }

    return result;

  }


  /**
   * checks, if both given filters are identical
   * @param   {Object}    filter1     one of the filters
   * @param   {Object}    filter1     the other filter
   * @returns {Boolean}               are both identical?
   */
  function isDuplicateFilter( filter1, filter2 ) {

    // both filter need to cover the same number of columns
    if( filter1.length != filter2.length ) {
      return false;
    }

    // check each column
    for( let i=0; i<filter1.length; i++ ) {

      // one of both is null, but the other one is set, failed
      if( xor( filter1[i] == null, filter2[i] == null ) ) {
        return false;
      }

      // both are null, is ok
      if( (filter1[i] == null) && (filter2[i] == null) ) {
        continue;
      }

      // differences between range and list types
      if( 'values' in filter1[i] ) {

        // list type

        // quick check: length
        if( filter1[i].values.length != filter2[i].values.length ) {
          return false;
        }

        // extensive check: values
        if( filter1[i].values.some( (v) => !filter2[i].values.includes( v ) ) ) {
          return false;
        }

      } else {

        // range type
        if( (filter1[i].minValue != filter2[i].minValue) || (filter1[i].maxValue != filter2[i].maxValue) ) {
          return false;
        }

      }

    }

    return true;
  }


  /**
   * XOR wrapper as JavaScript does not have an XOR operator
   */
  function xor( op1, op2 ) {
    return (op1 && !op2) || (!op1 && op2 );
  }

});