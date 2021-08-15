"use strict";
/**
 * search inside the metadata store for a dataset using constraints on the columns
 * result is a (possibly empty) list of datasets and their matching columns
 * concepts may just appear once per dataset
 *
 * Input Format:
 * { constraints: [ ... constraints ] }
 *
 * constraint:
 * {
 *    datatype: "number"  || "time" ,
 *    minValue: Number    || Date,
 *    maxValue: Number    || Date,
 *    concept:  URI       || null
 * }
 * or
 * {
 *    datatype:   "semantic",
 *    colEnums:   [ ... URIs for instances ]
 *    concept:    URI
 * }
 *
 * Output Format:
 * [ ... results ]
 *
 * result:
 * {
 *  ds:             URI,
 *  totalDimCount:  Number,
 *  covers: [{
 *    datatype:   "number" || "time" || "semantic"    // the datatype of this column
 *    concept:    URI,                                // covered concept
 *    totalEnumCount:  Number || null,                // number of total codelist values, if present
 *    minValue:   Number || Date || null,             // minimum value of range covered, if present
 *    maxValue:   Number || Date || null,             // maximum value of range covered, if present
 *    isMeas:     Boolean                             // is the column a measurement?
 *    colEnums:   Array[URI] || null                  // list of covered codelist values, if present
 *    codelist:   URI || null                         // codelist used for the column, if present
 *    order:      Number                              // order number of the column
 *  }, ... ]
 * }
 */
define([    'basic/Constants',
            'util/flatten.sparql',
            'load/SparqlClient',
            'store/metadata.sparql/getDatasetDimCount'
],function( Constants,
            flatten,
            SparqlClient,
            getDatasetDimCount
){

  // constants
  const SEPARATOR1 = '|',   // used for top level aggregation
        SEPARATOR2 = ',';   // used for second level aggregation

  // store link to query
  let doQuery;

  /**
   * function factory to preserve link to doQuery
   */
  function createFunction( query ) {

    // store link
    doQuery = query;

    // return the function
    return searchDatasetByConstraint;

  }

  /**
   * search for the best match to the given constraints
   */
  async function searchDatasetByConstraint( param ) {

    // shortcut
    let input = param.constraints || [];

    // common variables
    let partialResults = new Array( input.length ),       // collect results of column specific queries
        requestedColumns,                                 // which indices of before array are currently affected
        candidateDatasets;                                // which datasets are still considered candidates

    // make sure we have dates for time columns (and not seconds since epoch)
    param.constraints
      .forEach( (c) => {
        if( c.datatype == Constants.DATATYPE.TIME ) {
          if( typeof c.minValue == 'number' ) {
            c.minValue = (new Date( c.minValue )).toISOString();
          }
          if( typeof c.maxValue == 'number' ) {
            c.maxValue = (new Date( c.maxValue )).toISOString();
          }
        }
      });

    // ----------------------------- GET PER COLUMN RESULTS -----------------------------

    // which concepts of the query appear as measurements
    const concepts = [ ... new Set ( input.map( (col) => col.concept ) ) ];
    const measures = flatten( await doQuery( 'search/dsByConstraint/measureConcepts',{
                        concept: concepts.map( (v) => { return { type: 'uri', value: v } } )
                     }))
                     .map( (row) => row.concept );

    // start requests to get possible measurement columns
    requestedColumns = await startRequests( partialResults, input, [],
                                            (col) => measures.includes( col.concept ) );

    // wait for requests to finish
    partialResults = await Promise.all( partialResults );

    // process the answers
    let matchedDatasets = [];
    for( let i=0; i<requestedColumns.length; i++ ) {

      // shortcut
      const index = requestedColumns[i];

      // flatten results
      partialResults[index] = flatten( partialResults[index] );

      // which datasets are candidates
      matchedDatasets.push( partialResults[index].map( (el) => el.ds ) );

    }
    candidateDatasets = union( matchedDatasets );

    // start requests for remaining columns
    requestedColumns = await startRequests( partialResults, input, candidateDatasets,
                                            (col) => !measures.includes( col.concept ) );

    // wait for requests to finish
    partialResults = await Promise.all( partialResults );

    // process the answers
    for( let i=0; i<requestedColumns.length; i++ ) {

      // shortcut
      const index = requestedColumns[i];

      // flatten results
      partialResults[index] = flatten( partialResults[index] );

    }

    // --------------------------------- COMBINE RESULTS --------------------------------

    // collect columns per dataset
    // also: collect codelist columns, so we can can the total enumeration count for them
    const groupLookup = {},
          codelistColLookup = {};
    for( let i=0; i<partialResults.length; i++ ) {
      for( let entry of partialResults[i] ) {

        // group
        groupLookup[ entry.ds ] = groupLookup[ entry.ds ] || [];
        groupLookup[ entry.ds ].push( entry );

        // codelist columns
        if( 'codelist' in entry ) {
          codelistColLookup[ entry.codelist ] = codelistColLookup[ entry.codelist ] || [];
          codelistColLookup[ entry.codelist ].push({
            ds:         entry.ds,
            index:      groupLookup[ entry.ds ].length - 1,
          });
        }
      }
    }

    // get distinct codelists
    const codelists = Object.keys( codelistColLookup );

    if( codelists.length > 0 ) {

      // get the counts
      const counts = flatten( await doQuery( 'search/dsByConstraint/codelistCount_byCodelist',{
                        codelist: codelists.map( (v) => { return { type: 'uri', value: v } } )
                     }));

      // augment the respective columns
      for( let c of counts ) {
        for( let origin of codelistColLookup[ c.codelist ] ) {
          groupLookup[ origin.ds ][ origin.index ].totalEnumCount = c.count;
        }
      }
    }

    // filter datasets, that do not have at least 1 dimension and 1 measurement
    Object.keys( groupLookup )
          .forEach( (ds) => {

            const hasDim  = groupLookup[ds].some( (col) => col.role == Constants.ROLE.DIM ),
                  hasMeas = groupLookup[ds].some( (col) => col.role == Constants.ROLE.MEAS );

            if( !(hasDim && hasMeas) ) {
              delete groupLookup[ds];
            }
          });

    // process the datasets into the output format
    const result = Object.keys( groupLookup )
                         .map( (key) => {

                           // process columns
                           const cols = groupLookup[key]
                                         .map( (col) => {

                                           // formal datatype
                                           // TODO crude mapping
                                           let datatype;
                                           switch( true ) {
                                             case 'codelist' in col:
                                               datatype = Constants.DATATYPE.SEMANTIC; break;
                                             case col.colConcept == Constants.CONCEPT.TIME:
                                               datatype = Constants.DATATYPE.TIME; break;
                                             case typeof col.minValue == 'number':
                                               datatype = Constants.DATATYPE.NUMERIC; break;
                                             default:
                                               throw Error( 'Could not detect datatype!' );
                                           }

                                           return {
                                             datatype:        datatype,
                                             concept:         col.colConcept,
                                             colEnums:        col.colEnums ? col.colEnums.split( SEPARATOR1 ) : null,
                                             totalEnumCount:  (typeof col.totalEnumCount != 'undefined' ) ? col.totalEnumCount : null,
                                             minValue:        (typeof col.minValue != 'undefined' ) ? col.minValue : null,
                                             maxValue:        (typeof col.maxValue != 'undefined' ) ? col.maxValue : null,
                                             isMeas:          col.role == Constants.ROLE.MEAS,
                                             order:           +col.colOrder,
                                           };
                                         });

                           // time columns
                           cols.forEach( (col) => {
                             if( col.concept == Constants.CONCEPT.TIME ) {
                               col.minValue = new Date( col.minValue );
                               col.maxValue = new Date( col.maxValue );
                             }
                           });

                           return {
                             ds:      key,
                             covers:  cols,
                           };

                         });

    // no results => we stop here
    if( result.length < 1 ) {
      return [];
    }

    // -------------------------------- AUGMENT DATASETS --------------------------------

    // get involved datasets
    const datasets = result.map( (el) => el.ds );

    // get total dimension counts
    let counts = await getDatasetDimCount( doQuery, datasets );

    // build lookup
    const dsLookup = {};
    result.forEach( (el) => dsLookup[ el.ds ] = el );

    // augment with the respective counts
    Object.keys( counts )
      .forEach( (ds) => dsLookup[ ds ].totalDimCount = counts[ds] );

    // add measurement count to datasets
    result.forEach( (ds) => ds.measureCount = ds.covers.filter( col => col.isMeas ).length );

    // done
    return result;

  }

  /*XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * trigger requests for columns satisfying the given condition
   *
   * @param partialResults  {Array}         array to store the requests in
   * @param input           {Array}         input query
   * @param datasets        {Array}         list of datasets, which are used to narrow down the result
   * @param condition       {Function}      condition, which columns to use
   * @returns               {Array[Number]} indices of columns for which a request was started
   */
  async function startRequests( partialResults, input, datasets, condition ){

    // collect changed columns
    const affected = [];

    // build dataset filter
    let dsFilter = '';
    if( datasets && (datasets.length > 0) ) {
      dsFilter = await SparqlClient.prototype
                                    .prepareQuery( 'VALUES ?ds { {v} }', {
                                      'v': datasets.map( (d) => { return { type: 'uri', value: d } } )
                                    });
    }

    // start requests
    for( let i=0; i<input.length; i++ ) {

      // skip columns, for which the condition is not satisfied
      if( !condition( input[i] ) ) {
        continue;
      }

      // build request based on datatype
      let req;
      switch( input[i].datatype || '')  {

        case Constants.DATATYPE.TIME:
                        req = doQuery( 'search/dsByConstraint/datasetsByConstraint_numeric', {
                          ds:       dsFilter,
                          concept:  { type: 'uri', value: input[i].concept },
                          minValue: (('minValue' in input[i]) && input[i].minValue) ? `"${input[i].minValue}"^^xsd:dateTime` : '"0001-01-01T00:00:01.000Z"^^xsd:dateTime',
                          maxValue: (('maxValue' in input[i]) && input[i].maxValue) ? `"${input[i].maxValue}"^^xsd:dateTime` : '"9999-12-21T23:59:59.999Z"^^xsd:dateTime',
                        });
                        break;

        case Constants.DATATYPE.NUMERIC:
                        req = doQuery( 'search/dsByConstraint/datasetsByConstraint_numeric', {
                          ds:       dsFilter,
                          concept:  { type: 'uri', value: input[i].concept },
                          minValue: (('minValue' in input[i]) && input[i].minValue) ? input[i].minValue : Number.MIN_VALUE,
                          maxValue: (('maxValue' in input[i]) && input[i].maxValue) ? input[i].minValue : Number.MAX_VALUE,
                        });
                        break;

        case Constants.DATATYPE.SEMANTIC:
                        // build value filter, if values are given
                        let valueFilter = '';
                        if( input[i].colEnums && (input[i].colEnums.length > 0 ) ) {
                          valueFilter = await SparqlClient.prototype
                                                          .prepareQuery( 'VALUES ?colEnums { {v} }', {
                                                            'v': input[i].colEnums.map( (d) => { return { type: 'uri', value: d } } )
                                                          });
                        }
                        req = doQuery( 'search/dsByConstraint/datasetsByConstraint_codelist', {
                          ds:         dsFilter,
                          concept:    { type: 'uri', value: input[i].concept },
                          colEnums:   valueFilter,
                          separator:  SEPARATOR1,
                        });
                        break;

        default: throw new Error( 'Unknown datatype: ' + input[i].datatype );

      }

      // add to queue
      partialResults[i] = req;
      affected.push( i );

    }

    return affected;
  }


  /**
   * calculate the union of arrays; duplicates removed
   */
  function union( arrays ) {

    // if there is just one element in the list, return that
    if( arrays.length == 1 ) {
      return arrays[0];
    } else if ( arrays.length == 0 ){
      return [];
    }

    // connect all arrays
    const all = arrays[0].concat( ... arrays.slice( 1 ) );

    // return unique entries
    return [ ... new Set(all) ];

  }

  return createFunction;

});