"use strict";
/*
 * extract the necessary data items to form a complete pseudoworkflow for the current selection
 *
 */
define( [ 'jquery' ], function( $ ){

  return function getExecRequest( $dialog ){

    // grab a reference to the raw search results
    const searchResult = $dialog.data( 'result' );

    // get link to the adjustment tab
    const $adjustTab = $dialog.find( '#constructDatasetTabs4' );

    // extract options for each dataset to aggregate
    const activeAdjusts = getAdjustData( $adjustTab, searchResult );

    // make a copy of the original pwf to transform
    const pwf = JSON.parse( JSON.stringify( searchResult.pwf ) );

    // if it's just a single dataset, return the respective load option
    if( Number.isInteger( pwf ) ) {
      return getLoadAction( pwf, searchResult.components[ pwf ], activeAdjusts );
    }

    // if we came this far, it is a complex workflow, so traverse the tree
    // and replace the respective numerical references
    traverse( pwf, (node) => {

      // replace ops with respective actions, if pointing to dataset
      if ( Number.isInteger( node.op1 ) ) {
        node.op1 = getLoadAction( node.op1, searchResult.components[ node.op1 ], activeAdjusts );
      }

      // replace ops with respective actions, if pointing to dataset
      if ( Number.isInteger( node.op2 ) ) {
        node.op2 = getLoadAction( node.op2, searchResult.components[ node.op2 ], activeAdjusts );
      }

    });

    return pwf;

  }


  /**
   * get the respective load action for datase #index
   * augmented with the filter, adjustment data given
   *
   * @param     {Number}    index         dataset index
   * @param     {Array}     components    list of all involved datasets
   * @param     {Array}     adjusts       adjustments selected by the user
   * @returns   {Object}                  an object representing the respective loading action
   */
  function getLoadAction( index, ds, adjusts ) {

    // get corresponding adjustment function, if existing
    let adj = adjusts.find( (entry) => entry.ds == ds.ds );

    // create load action
    let loadAction = {
      op: 'L',
      ds: ds.ds
    };

    // do we have active filters?
    let filters = Object.keys( ds.filter )
                        .map( (key) => {

                          // shortcut
                          let fEntry = ds.filter[ key ];

                          // for codelist columns, store the codelist
                          if( 'codelist' in ds.columns[ fEntry.order ] ) {
                            fEntry.codelist = ds.columns[ fEntry.order ].codelist;
                          }

                          // at this point order = colIndex + 1
                          // for execution the colIndexes are used
                          fEntry.col = fEntry.order - 1;
                          delete fEntry.order;

                          // just include filters, that have an effect
                          return fEntry.effective ? fEntry : null;

                        })
                        .filter( (entry) => entry );
    if( filters.length > 0 ) {

      // insert the respective filter between load and further filtering
      loadAction = {
        op:     'F',
        param:  filters,
        op1:    loadAction
      };

    }

    // if we have no adjustment function, we are done
    if( !adj ) {
      return loadAction;
    }

    // else, we have to add another adjustment action
    let action;
    switch( adj.action ) {
      case 'agg':     action = 'A'; break;
      case 'filter':  action = 'F'; break;
      default: throw Error( 'Unkown adjustment function: ' + adj.action );
    }

    // create adjustment action
    let adjustAction = {
      op:    action,
      param: adj.param,
      op1:   loadAction
    };

    // and drop the now superfluous columns
    return {
      op:     'D',
      param:  ds.aggColumns,
      op1:    adjustAction
    };

  }


  /**
   * traverse the given pseudoworkflow and apply the callback to each node
   * postorder is needed as we replace some nodes, that should not be visited afterwards
   *
   * @param     {Object}    node      the root of the current (sub)tree
   * @param     {Function}  cb        callback to be applied
   */
  function traverse( node, cb ) {

    // recursive calls
    if( typeof node == 'object' ) {
      traverse( node.op1, cb );
      traverse( node.op2, cb );
    }

    // apply callback
    cb( node );

  }


  /**
   * scan the adjustment tab and extract relevant information:
   *
   * - dataset
   * - selected adjustment method
   * - necessary parameters
   *
   * @param     {jQuery}    $adjustTab      jQuery object representing the adjustment tab
   * @returns   {Object}                    relevant information as given in description
   */
  function getAdjustData( $adjustTab, searchResult ) {

    // get all adjustment entries
    return $adjustTab
      .find( '.adjitem')
      .map( (ind,el) => {

        // shortcut
        let $el = $(el);

        // find tabs
        let $tabs = $el.find( '.subtabs' );

        // get active tab;
        // highly unstable solution, but it seems there is no better way
        let activeIndex    = $tabs.tabs( 'option', 'active' ),
            $activeTab     = $tabs.find( '> ul > li > a' ).eq( activeIndex ),
            $activeContent = $tabs.find( $activeTab.attr( 'href' ) ),
            colCategories  = $el.data();

        // get data
        const res = {
            ds:     $el.find( '.dataset' ).data( 'uri' ),
            action: $activeTab.data( 'action' ),
            param:  null
        };

        // depending on action type, we need different parameters
        switch( res.action ) {

          case 'agg': // grab the aggregate functions for all columns
                      res.param = {
                        agg: [],
                        remCols:      colCategories.remCols.map( (order) => order - 1 ),      // need col indexes not orders
                        aggCols:      colCategories.aggCols.map( (order) => order - 1 ),      // need col indexes not orders
                        groupByCols:  colCategories.groupByCols.map( (order) => order - 1 ),  // need col indexes not orders
                      };
                      $activeContent
                        .find( '> ul > li' )
                        .each( (ind, el) => {

                          // shortcut
                          let $el = $(el);

                          // append column categories
                          res.remCols     = colCategories.remCols;
                          res.aggCols     = colCategories.aggCols;
                          res.groupByCols = colCategories.groupByCols;

                          // get from column element: uri and orderIndex
                          let $colItem  = $el.find( '[data-uri]' ),
                              colUri    = $colItem.data( 'uri' ),
                              order     = $colItem.data( 'order' );

                          // get selected aggregation function
                          let aggFkt = $el.find( 'select' ).val();

                          // push to parameter list
                          res.param.agg.push({
                            uri:    colUri,
                            col:    order - 1,    // we need column index here and not dataset order
                            aggFkt: aggFkt
                          });

                        });
                      break;

          case 'filter': // grab the aggregate functions for all columns
                      res.param = [];
                      $activeContent
                        .find( '> ul > li' )
                        .each( (ind, el) => {

                          // shortcut
                          let $el = $(el);

                          // get from column element: uri and orderIndex
                          const $colItem  = $el.find( '[data-uri]' ),
                                colUri    = $colItem.data( 'uri' ),
                                order     = $colItem.data( 'order' );

                          // get selected value to filter for
                          const $filterSelect = $el.find( 'select' ),
                                filterVal     = $filterSelect.val(),
                                codelist      = $filterSelect.data( 'codelist' );

                          // push to parameter list
                          res.param.push({
                            uri:    colUri,
                            col:    order - 1,    // we need column index here and not dataset order
                            values: [ filterVal ],
                            codelist: codelist
                          });

                        });
                      break;

          default: throw new Error( 'Unsupported adjustment action! Did you temper with the DOM?' );
        }

        return res;

      })
      .get();

  }

});