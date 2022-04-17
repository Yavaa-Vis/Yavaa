/**
 * convert the given pseudo-workflow into a sequence of commands
 * commands are ordered by their distance from the root (== final result) in the workflow,
 * such that commands with no dependencies can be executed first
 */
"use strict";
define( [], function(){

  // constants
  const DATE_REGEXP = /^\d{4}-[01]\d-[0-3]\d/;    // string starts with a date

  return parse;

  /**
   *
   * @param prov
   * @returns
   */
  async function parse( pwf ) {

    // init result
    let result = {
        stack:  [],
        lookup: {}
    };

    // add all entries
    let unique = 0;   // we need some counter to make activity names unique
    postOrderWalk( pwf, (node) => {

      // create command
      let command = createCommand( node, unique++ );

      // add to stack
      result.stack.push( command );

      // add to lookup
      result.lookup[ command.activity ] = command;

    });

    // reverse stack as the dependencies are sorted inverse up to now
    result.stack.reverse();

    return result;
  }


  /**
   * traverse the given pwf and execute the callback for each node
   * postorder
   *
   * @param     {Object}    node      current node to traverse
   * @param     {Function}  cb        callback to execute
   */
  function postOrderWalk( node, cb ) {

    // traverse children
    if( 'op1' in node ){ postOrderWalk( node.op1, cb ); }
    if( 'op2' in node ){ postOrderWalk( node.op2, cb ); }

    // execute callback
    cb( node );

  }


  /**
   * create the command corresponding to the respective node
   *
   * @param     {Object}    node      current node describing a command
   * @returns   {Object}              the command
   */
  function createCommand( node, unique ) {

    // depends on the node type
    switch( node.op.toUpperCase() ) {

      // load dataset
      case 'L': node.activity = '_:load' + unique;
                return  {
                          activity: node.activity,
                          command: {
                            action: 'loadData',
                            params: {
                              id: node.ds
                            }
                          },
                          uses: null
                        };

      // join two datasets
      case 'J': node.activity = '_:join' + unique;
                return  {
                          activity: node.activity,
                          command:{
                            action: 'join',
                            params: {
                              base_data_id: null,
                              augm_data_id: null,
                              join_cond: node.cond
                            }
                          },
                          uses: [ node.op1.activity, node.op2.activity ]
                        };

      // join two datasets
      case 'U': node.activity = '_:union' + unique;
                return  {
                          activity: node.activity,
                          command:{
                            action: 'union',
                            params: {
                              base_data_id: null,
                              augm_data_id: null,
                              union_cond: node.cond
                            }
                          },
                          uses: [ node.op1.activity, node.op2.activity ]
                        };

      // drop a column
      case 'D': node.activity = '_:drop' + unique;
                return  {
                          activity: node.activity,
                          command:{
                            action: 'dropColumns',
                            params: {
                              data_id: null,
                              columns: node.param.map( (c) => c-1 )
                            }
                          },
                          uses: [ node.op1.activity ]
                        };

      // aggregate
      case 'A': // unique id for this activity
                node.activity = '_:agg' + unique;

                // collect aggregation functions
                const aggFkt = [];
                node.param.remCols.forEach( (colInd) => aggFkt[ colInd ] = 'bag' );
                node.param.groupByCols.forEach( (colInd) => aggFkt[ colInd ] = null );
                node.param.agg.forEach( (agg) => aggFkt[ agg.col ] = agg.aggFkt );
                return {
                          activity: node.activity,
                          command: {
                            action: 'aggregate',
                            params: {
                              data_id: null,
                              cols: node.param.groupByCols,
                              agg:  aggFkt
                            }
                          },
                          uses: [ node.op1.activity ]
                        };


      // filter
      case 'F': // unique id for this activity
                node.activity = '_:filter' + unique;

                // build filter objects for all necessary
                const filters = node.param
                                  .map( (f) => {

                                    switch( true ) {

                                      // Entity filter
                                      case ('values' in f):

                                        // return filter object
                                        return {
                                          "operator": "EntityFilter",
                                          "include":  true,
                                          "column":   f.col,
                                          "values":   f.values
                                        };

                                      // Number / Date filter
                                      case (('minValue' in f) || ('maxValue' in f)):

                                        // number or date?
                                        const isDate = DATE_REGEXP.test( f.minValue ) || DATE_REGEXP.test( f.maxValue );

                                        return {
                                          "operator": isDate ? 'DateRangeFilter' : 'NumberRangeFilter',
                                          "include":  true,
                                          "column":   f.col,
                                          "values": {
                                            "min": f.minValue,
                                            "max": f.maxValue,
                                          },
                                        };
                                    }

                                  });

                return  {
                          activity: node.activity,
                          command: {
                            action: 'filterData',
                            params: {
                              data_id: null,
                              "filterDef" : {
                                "operator": "and",
                                "values":   filters
                              }
                            }
                          },
                          uses: [ node.op1.activity ],
                        };

      // everything else: we don't know
      default: throw new Error( 'Missing implementation' );

    }

  }

});