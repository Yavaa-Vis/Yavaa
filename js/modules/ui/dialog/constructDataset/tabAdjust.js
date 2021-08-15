"use strict";
/*
 * provide code for forth tab: adjust
 *
 *
 */
define( [ 'basic/Constants',
          'jquery',
          'jquery-ui',
          'ui/basic/Yavaa.global',
          'text!template/ui/dialog/constructDataset/tabAdjust_entry.htm',
          'text!template/ui/dialog/constructDataset/tabAdjust_entry_aggcol.htm',
          'text!template/ui/dialog/constructDataset/tabAdjust_entry_filter.htm',
          'text!template/ui/dialog/constructDataset/tabAdjust_entry_nofilter.htm',
          'text!template/ui/common/column.htm',
          'text!template/ui/common/dataset.htm',
          ],
function( Constants,
          $,
          jqueryUI,
          Y,
          templEntry,
          templEntry_aggcol,
          templEntry_filter,
          templEntry_nofilter,
          templColumn,
          templDataset
){

  // local config object; will be set after init
  let localCfg,       // config object
      $dialog,        // dialog container

  // regular expressions
      regexpDs        = /{ds}/gi,
      regexpLabel     = /{label}/gi,
      regexpUri       = /{uri}/gi,
      regexpRemovals  = /{removals}/gi,
      regexpCol       = /{col}/gi,
      regexpAggcol    = /{aggcol}/gi,
      regexpFiltercol = /{filtercol}/gi,
      regexpType      = /{type}/gi,
      regexpCodelist  = /{codelist}/gi,
      regexpUnique    = /{unique}/gi,
      regexpOrder     = /{order}/gi,

  // some unique id
      unique = Date.now();

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Update View XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * update the adjustment view
   *
   * @param     {Array[Array]}  values        dataset list
   */
  async function update( values, nameLookup ) {

    // create output for each dataset, where an aggregation is necessary
    let $out = values
                .filter( (ds) => ds.aggColumns.length > 0 )       // only those, where something need to be aggregated
                .map( (ds) => {

                  // classify columns
                  const remCols = ds.aggColumns,       // TODO make that name more consistent
                        aggCols = ds.columns
                                    .filter( (col) => {

                                      return    col                                 // skip empty entries
                                             && (col.role == Constants.ROLE.MEAS)   // only measurements
                                             && (!remCols.includes( col.order ));   // which are not to be removed

                                    })
                                    .map( (col) => col.order ),
                       groupByCols = ds.columns
                                       .filter( (col) => col )
                                       .map( (col) => col.order )
                                       .filter( (colOrder) => !remCols.includes( colOrder ) && !aggCols.includes( colOrder ) );

                  // create output for columns to remove
                  let removals = remCols
                                   .map( (colInd) => {

                                     // shortcut to column object
                                     const col = ds.columns[ colInd ];

                                     // get label
                                     const label = ('label' in col)
                                                   ? col.label
                                                   : ((col.concept in nameLookup) ? nameLookup[col.concept] : col.concept);

                                     // add to template
                                     const out = templColumn.replace( regexpLabel, label )
                                                            .replace( regexpUri,   col.concept )
                                                            .replace( regexpOrder, col.order );

                                     return out;

                                   })
                                   .filter( (entry) => {
                                     return !!entry;
                                   });


                  // create output for columns, that might be aggregated
                  let agg = aggCols
                              .map( (colInd) => {

                                // shortcut to column object
                                const col = ds.columns[ colInd ];

                                // get label
                                const label = ('label' in col)
                                              ? col.label
                                              : ((col.concept in nameLookup) ? nameLookup[col.concept] : col.concept);

                                // create column item
                                const colItem = templColumn.replace( regexpLabel, label )
                                                           .replace( regexpUri,   col.concept )
                                                           .replace( regexpOrder, col.order );

                                // insert into entry template
                                const entry = templEntry_aggcol.replace( regexpCol, colItem )
                                                                .replace( regexpType, col.datatype );

                                return entry;

                              });


                  // create output for columns, that might be filtered
                  let filterable = true;
                  let filter = remCols
                                  .map( (colInd) => {

                                    // shortcut to column object
                                    const col = ds.columns[ colInd ];

                                    // get label
                                    let label = ('label' in col)
                                                  ? col.label
                                                  : ((col.concept in nameLookup) ? nameLookup[col.concept] : col.concept);

                                    // filtering is currently just enabled for codelist columns
                                    // TODO enable filter on numeric/time columns in else part; if implemented remove disable tab further down
                                    let filterItem;
                                    if( 'codelist' in col ) {

                                      // create column item
                                      let colItem = templColumn.replace( regexpLabel, label )
                                                               .replace( regexpUri,   col.concept )
                                                               .replace( regexpOrder, col.order );

                                      // create column item
                                      filterItem = templEntry_filter.replace( regexpCol, colItem )
                                                                    .replace( regexpCodelist, col.codelist );

                                    } else {
                                      // can't filter this dataset
                                      filterable = false;
                                      return;
                                    }

                                    // schedule this column
                                    return filterItem;

                                  });

                  // set filter part of output
                  let filtertempl;
                  if( filterable ) {
                    filtertempl = filter.join( "\n" );
                  } else {
                    filtertempl = templEntry_nofilter;
                  }

                  // get label
                  const label = (ds.ds in nameLookup) ? nameLookup[ds.ds] : ds.ds;

                  // create dataset tag
                  const dstag = templDataset.replace( /{uri}/g,    ds.ds )
                                            .replace( /{label}/g,  label );

                  // create entry template
                  let tabUnique = unique++,
                      out = templEntry.replace( regexpDs,         dstag )
                                      .replace( regexpRemovals,   removals.join( '' ) )
                                      .replace( regexpAggcol,     agg.join( '\n' ) )
                                      .replace( regexpFiltercol,  filtertempl )
                                      .replace( regexpUnique,     tabUnique )
                                      ;

                  // convert to jQuery object
                  let $out = $( out );

                  // add some more data, so we do not have to find that later on
                  $out.data({
                    remCols:      remCols,
                    aggCols:      aggCols,
                    groupByCols:  groupByCols
                  });

                  // set some tabs to be disabled
                  let disabledTabs = [
                    2,                            // add tab is disabled by default right now
                    filterable ? undefined : 1,   // filter tab is sometimes disabled
                  ];
                  $out.find( '.subtabs' )
                    .data( 'disabled', disabledTabs );

                  // done
                  return $out;

                });

    // shortuct to container
    let $cont = $( localCfg.tabAdjustList );

    // insert adjustment templates into DOM
    $cont.html( $out );

    // trigger resolving of codelists
    await getCodelistOptions( $cont );

    // is the adjust tab required?
    // will be picked up from the outside to disable the whole adjust-tab
    if( !isAdjustNeeded( $cont ) ){
      $dialog.find( localCfg.tabAdjust ).data( 'disabled', true );
    }

    // enable tabs
    $cont
      .find( '.subtabs' )
      .each( (ind, el ) => {

        // shortcut
        let $el = $(el);

        // enable tabs
        $el.tabs({
          disabled: $el.data( 'disabled' )
        });

      });


  }


  /**
   * retrieve the options for codelists given in the fragment
   * elements have to posses a data-codelist attribute to be recognized here
   *
   * @param     {jQuery}    $cont       parent element
   */
  async function getCodelistOptions( $cont ) {

    // extract codelists
    let codelistsReq = $cont
                      .find( '[data-codelist]' )
                      .map( (ind, el) => { return $(el).data( 'codelist' ) })
                      .get();

    // if there is nothing to resolve, just stop
    if( codelistsReq.length < 1 ) {
      return;
    }

    // make codelist values unique
    codelistsReq =[ ... new Set( codelistsReq ) ];

    // retrieve codelists
    const res = await Y.CommBroker
                        .execCommand({
                          'action': 'resolveCodelists',
                          'params': {
                            'uris': codelistsReq
                          }
                        }),
          codelists = res.params.results;

    // insert values to all codelists options
    $cont
      .find( '[data-codelist]' )
      .each( (ind, el) => {

        // shortcut
        let $el = $(el),

        // get the URI of the referenced codelist
            cl = $el.data( 'codelist' ),

        // and the value list
            values = codelists[ cl ] || [];

        // build option elements
        let $options = values.map( (val) => {
                              return $( '<option />' )
                                       .attr( 'data-uri', val.uri )
                                       .val( val.uri )
                                       .text( val.label );
                            });

        // attach option elements to container
        $el.html( '' ).append( $options );

      });

  }


  /**
   * check, if there are datasets, that have only to remove a single-valued column
   * those do not have to be adjusted, but can just be dropped
   *
   * if only those exist, we can hide the adjust tab altogether
   *
   * @return  {Boolean}     true, if there is an actual decision to make, false otherwise
   */
  function isAdjustNeeded( $cont ) {

    // get datasets, that might need adjustments
    const $allDs = $cont.find( '.tag.dataset' ).closest( 'li' );

    // process each dataset individually
    let adjustNeeded = false;
    for( let i=0; i<$allDs.length; i++ ) {

      // shortcut
      const $ds = $allDs.eq(i);

      // if there are "no-filter"-elements in here, this can not be hidden
      const $noFilter = $ds.find( '[data-nofilter]' );
      if( $noFilter.length > 0 ) {
        adjustNeeded = true;
        continue;
      }

      // get codelist selects
      const $filterSelects = $ds.find( '[data-codelist]' );
      let allSingleValued = true;
      for( let j=0; j<$filterSelects.length; j++ ) {

        // see, if there is more than one option present
        const $options = $filterSelects.eq(j).find( 'option' );
        allSingleValued = allSingleValued && ($options.length < 2);

      }

      // if all codelists are single valued, there is no need to adjust
      // we just use "takeOne" as an aggregation function and hide this dataset
      if( allSingleValued ) {

        // select the "takeOne" aggregation
        $ds.find( '.filterDatatypes select option[value="takeOne"]' )
           .prop( 'selected', true );

        // hide dataset in adjust tab
        $ds.hide();

        // remember the result
        $ds.data( 'singlevaluedAggregation', true );

      } else {

        // if there is something to choose somewhere, we need the adjust tab
        adjustNeeded = true;

      }

    }

    return adjustNeeded;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Return Value XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * initialize this query tab
   *
   * @param   {jQuery}    $dialog       reference to the dialog element
   * @param   {jQuery}    $content      the tab container element
   * @returns {Function}                function to serialize all inputs
   */
  return function tabAdjust( $dialogRef, $content, cfg ) {

    // copy references to config objects
    localCfg = cfg;
    $dialog = $dialogRef


    // return global function pointers
    return {
      update: update
    };
  }

});