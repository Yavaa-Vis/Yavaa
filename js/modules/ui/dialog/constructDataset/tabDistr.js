"use strict";
/*
 * provide code for third tab: distribution
 *
 *
 *
 */
define( [ 'jquery',
          'ui/basic/Yavaa.global',
          'd3',
          'viz/Sunburst.plot',
          'text!template/ui/common/dataset.htm',
        ],
function( $,
          Y,
          d3,
          Sunburst,
          templDataset
){

  // local config object; will be set after init
  let localCfg,       // config object
      $dialog;        // dialog container

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Create Chart XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * create a Sunburst chart based on the given data values
   * and insert it as a child of the given parent container
   *
   * values have to be of the following form:
   *
   * [ [ SourceName, DatasetName, Size ], ... ]
   *
   * @param     {String}        parent    parent container selector
   * @param     {Array[Array]}  values    values to visualize
   */
  function createChart( parent, values ) {

    // clear the parent selector
    $( parent ).empty();

    // group by URI on 2nd level
    for( let i=0; i<values.children.length; i++ ) {
      const grouped = values.children[i]
                            .children
                            .reduce((all, el) => {
                              if( el.uri in all ) {
                                all[ el.uri ].size += el.size;
                              } else {
                                all[ el.uri ] = el;
                              }
                              return all;
                            }, {});
      values.children[i].children = Object.values( grouped );
    }

    // draw the Sunburst diagram
    const svgID = 'Sunburst' + Date.now();
    $( parent ).attr( 'id', svgID );
    Sunburst( window.document, d3, values, {
      'id':         svgID,
      'width':      400,
      'height':     400,
      'dataAttr':   'uri',
      'classes':    'chartEl',
      'hierarchy':  0,
      '_domains':[{
        list: values.children.map( el => el.name ),
      }]
    });

  }


  /**
   * create the animation links between chart and plain list for dataset distributions
   *
   * @param     {String}    parent    selector to identify the parent container of both
   * @param     {String}    chart     selector to identify the chart
   * @param     {String}    list      selector to identify the list
   */
  function linkListToChart( parent, chart, list ) {

    // build lookup for colors
    let colorLookup = {};
    $( chart + ' [data-yavaa]' )
     .each( (ind, el) => {
       let $el = $(el),
           id  = JSON.parse( $el.data( 'yavaa' ) );
       colorLookup[ id ] = {
         el:    $el,
         color: $el.css( 'fill' )
       };
     });

    // add to list elements
    $( list + ' li' )
      .filter( function( ind, el ) {

        // skip elements with no URI assigned
        return !!$( el ).data( 'uri' );

      })
      .each( (ind, el) => {

        // shortcut
        const $el = $(el);

        // get respective element in chart
        const $chartEl = colorLookup[ $el.data('uri') ];

        // prepend respective icon
        $el.prepend( '<span class="colorIcon" style="background-color: ' + $chartEl.color + ';"></span>')

        // attach corresponding chart element
        $el.data( 'chartEl', $chartEl.el );

      })
      .on( 'mouseover', function(e){
        let $this = $(this);
        $this.data( 'chartEl' ).get(0).classList.add( 'marked' ); // jquery 2.x fix; should be more jQueryish with 3.x
        $this.children( '.colorIcon' ).addClass( 'marked' );
        $( parent ).addClass( 'fade' );
      })
      .on( 'mouseout', function(e){
        let $this = $(this);
        $this.data( 'chartEl' ).get(0).classList.remove( 'marked' ); // jquery 2.x fix; should be more jQueryish with 3.x
        $this.children( '.colorIcon' ).removeClass( 'marked' );
        $( parent ).removeClass( 'fade' );
      });

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Create List XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * create the list of used datasets and insert the result into the DOM
   *
   * @param     {String}      selector      selector for parent list element
   * @param     {Object}      values        converted list of values as per convertData()
   * @param     {Object}      nameLookup    a lookup for labels of URIs
   */
  function createList( selector, values, nameLookup ) {

    // collect the elements
    let $els = $();

    // walk all sources
    for( let i=0; i<values.children.length; i++ ) {

      // create list for this source
      let $ds = $(),
          src = values.children[i];

      // walk all included datasets
      for( let j=0; j<src.children.length; j++ ) {

        // create list entry for dataset
        let ds  = src.children[j],
            $el = $( '<li>' );
        $el.data( 'uri', ds.uri );

        // get label
        const label = ('name' in ds)
                      ? ds.name
                      : ( (ds.uri in nameLookup) ? nameLookup[ds.uri] : ds.uri );

        // create dataset tag
        const tag = templDataset.replace( /{uri}/g,    ds.uri )
                                .replace( /{label}/g,  label );
        $el.html( tag );

        // add to collection
        $ds = $ds.add( $el );

      }

      // get label for source
      let label = (src.uri in nameLookup) ? nameLookup[src.uri] : src.uri;

      // create entry for source
      let $el = $( '<li />' ).append( $( '<ul />' ).append( $ds ) );
      $el.prepend( label );
      $el.data( 'uri', src.uri );

      // add to collection
      $els = $els.add( $el );

    }

    // add to container
    $( selector ).html( $els )

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Convert Values XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * convert the given array of fitting datasets to a hierarchical structure to be shown in list and chart
   *
   * @param     {Array}   values      datasets to be used
   * @returns   {Object}              respective hierarchy; fitting for Sunburst chart
   */
  function convertData( values ) {

    // prep result
    let res     = [],
        lookup  = {};

    // add all datasets
    for( let i=0; i<values.length; i++ ) {

      // shortcut
      let ds = values[i];

      // make sure there is an entry for the source
      if( !(ds.dsPublisher in lookup) ) {

        // create entry
        let newEntry = {
            uri:  ds.dsPublisher,
            children: []
        }

        // add
        lookup[ ds.dsPublisher ] = newEntry;
        res.push( newEntry );

      }

      // add this dataset
      lookup[ ds.dsPublisher ].children.push({
        uri:  ds.ds,
        size: ds.coverage
      })

    }

    // add main wrapper and return
    return {
      name:     'result',
      children: res
    };

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Return Value XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * initialize this query tab
   *
   * @param   {jQuery}    $dialog       reference to the dialog element
   * @param   {jQuery}    $content      the tab container element
   * @returns {Function}                function to serialize all inputs
   */
  return function tabQuery( $dialogRef, $content, cfg ) {

    // copy references to config objects
    localCfg = cfg;
    $dialog = $dialogRef

    // return global function pointers
    return {

      update: function( values, nameLookup ){

        // convert data
        let convValues = convertData( values );

        // create the chart
        createChart( localCfg.tabDistrChart, convValues );

        // create list
        createList( localCfg.tabDistrList, convValues, nameLookup );

        // enhance the list
        linkListToChart( localCfg.tabDistr, localCfg.tabDistrChart, localCfg.tabDistrList );

      }

    };
  }

});