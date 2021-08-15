"use strict";
/*
 * provide code for second tab: results
 *
 *
 *
 */
define( [ 'jquery',
          'ui/basic/Yavaa.global',
          'basic/Constants',
          'moment',
          'text!template/ui/common/column.htm',
          'text!template/ui/common/value.htm',
          'text!template/ui/dialog/constructDataset/tabResult_nomatch.htm',
        ],
function( $,
          Y,
          Constants,
          Moment,
          templColumn,
          templValue,
          templNoMatch
){

  // local config object; will be set after init
  let localCfg,       // config object
      $dialog,        // dialog container
      $templ = {},    // template items
      $els   = {},    // shortcuts to some elements

  // regexp
      regexpLabel = /{label}/gi,
      regexpUri   = /{uri}/gi,
      regexpOrder = /{order}/gi,
      regexpClass = /{classes}/gi
      ;


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Update View XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * update the adjustment view
   *
   * @param     {Array[Object]}  query         the original query as sent to the server (by the user)
   * @param     {Object}         results       the result as sent from the server
   * @param     {Object}         nameLookup    cache of concept to label mappings
   */
  function update( query, results, nameLookup ) {

    // create column list
    const out = [];
    for( let i=0; i<query.length; i++ ) {

      // create values
      let $values;
      const matchingResult = results[i];
      if( !matchingResult ) {

        // could not match the query part
        $values = $(templNoMatch);

      } else {

        // could match the query part
        switch( query[i].datatype.toLowerCase() ) {

          case Constants.DATATYPE.SEMANTIC:
            $values = createColumnCodelist( query[i], matchingResult, nameLookup );
            break;

          case Constants.DATATYPE.NUMERIC:
          case Constants.DATATYPE.TIME:
            $values = createColumnNumeric( query[i], matchingResult, nameLookup );
            break;

          default:
            throw Error( `Unknown datatype: ${query[i].datatype}` );

        }

      }

      // get column label
      const label = (matchingResult && ('label' in matchingResult) )
                    ? matchingResult.label
                    : ((query[i].concept in nameLookup) ? nameLookup[query[i].concept] : query[i].concept);

      // prepare column item
      const col = templColumn.replace( regexpLabel, label )
                             .replace( regexpUri,   query[i].concept )
                             .replace( regexpOrder, '' );

      // complete entry
      const $entry = $templ.resultItem.clone( true );
      $entry.find( '.col' ).html( $( col ) );
      $entry.find( '.val' ).html( $values );

      // add to result
      out.push( $entry );

    }

    // add to DOM
    $els.resultList.html( out );

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Create Column XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * create the view for a codelist column
   *
   * @param     {Object}  query         the original query as sent to the server (by the user)
   * @param     {Object}  results       the result as sent from the server
   * @param     {Object}  nameLookup    cache of concept to label mappings
   * @returns   {String}                HTML markup for the given column
   */
  function createColumnCodelist( query, result, nameLookup ) {

    // sort values
    result.values.sort( (a,b) => {
      return ((a in nameLookup) ? nameLookup[ a ] : a).localeCompare( (b in nameLookup) ? nameLookup[ b ] : b );
    })

    // populate values
    let values;
    if( query.colEnums.length < 1 ) {

      // no specific values requested, label all results as success
      values = result
                .values
                .map( (val) => {
                  return templValue.replace( regexpUri,    val )
                                   .replace( regexpLabel,  (val in nameLookup) ? nameLookup[val] : val )
                                   .replace( regexpClass, 'suc' );
                });

    } else {

      // specific values requested, so we have to check whether they could be retrieved

      // build lookup of value URIs
      const lookup = new Set( result.values );

      // build value list
      values = query
                .colEnums
                .map( (val) => {

                  // did we find this value?
                  let klass;
                  if( lookup.has( val ) ){
                    klass = 'suc';
                  } else {
                    klass = 'fail';
                  }

                  // return entry
                  return templValue.replace( regexpUri,   val )
                                   .replace( regexpLabel, (val in nameLookup) ? nameLookup[val] : val )
                                   .replace( regexpClass, klass );
                });

    }

    // prep result
    const $res = $templ.codelist.clone( true );
    $res.prepend( values.join( '' ) );
    if( values.length > 20 ) {
      $res.find( '.amount' ).text( values.length - 20 );
    } else {
      $res.find( '.readmore' ).hide();
    }
    return $res;

  }


  /**
   * create the view for a numeric or time column
   *
   * @param     {Object}  query         the original query as sent to the server (by the user)
   * @param     {Object}  results       the result as sent from the server
   * @param     {Object}  nameLookup    cache of concept to label mappings
   * @returns   {String}                HTML markup for the given column
   */
  function createColumnNumeric( query, result, nameLookup ) {

    // collect and calculate values needed
    const vals = {

        // is there any value given at all?
        reqGiven:   ((typeof query.minValue !== 'undefined') ? ' requestMin' : '')
                  + ((typeof query.maxValue !== 'undefined') ? ' requestMax' : ''),

        // start- and endpoint of the total bar
        min:   (typeof query.minValue !== 'undefined') ? query.minValue : result.minValue,
        max:   (typeof query.maxValue !== 'undefined') ? query.maxValue : result.maxValue,

        // start- and endpoint of the found bar
        foundMin: 0,
        foundMax: 0,

        // width of the found bar
        foundWidth: 0,

    };
    vals.width = vals.max - vals.min;
    vals.foundMin   = ((result.minValue - vals.min) / vals.width).toFixed( 4 );
    vals.foundMax   = ((vals.max - result.maxValue) / vals.width).toFixed( 4 );
    vals.foundWidth = (100 * (1 - vals.foundMax - vals.foundMin)).toFixed( 4 );

    // insert into values template
    const $entry = $templ.numeric.clone( true );
    $entry.addClass( vals.reqGiven );
    $entry.find( '.left  .requestMin' ).text( formatValue( query.datatype, query.minValue ) );
    $entry.find( '.right .requestMax' ).text( formatValue( query.datatype, query.maxValue ) );
    $entry.find( '.left  .resultMin' ).text( formatValue( result.datatype, result.minValue ) );
    $entry.find( '.right .resultMax' ).text( formatValue( result.datatype, result.maxValue ) );
    // some weird bug in Chrome prevents using jQuery's css function here
    // TODO check in future updates
    /*
    $entry.find( '.partial' ).css({
      width: `${vals.foundWidth}%`,
      left:  `${vals.foundMin}%`,
    });
    $entry.find( '.barmin' ).css( 'width', `calc( (100% - 1em ) * ${vals.foundMin} + 0.5em )` );
    $entry.find( '.barmax' ).css( 'width', `calc( (100% - 1em ) * ${vals.foundMax} + 0.5em )` );
     */
    const el = $entry.find( '.partial' ).get( 0 );
    el.style.width =  `${vals.foundWidth}%`;
    el.style.left  =  `${vals.foundMin}%`;
    $entry.find( '.barmin' ).get( 0 ).style.width = `calc( (100% - 1em ) * ${vals.foundMin} + 0.5em )`;
    $entry.find( '.barmax' ).get( 0 ).style.width = `calc( (100% - 1em ) * ${vals.foundMax} + 0.5em )`;

    return $entry;

  }


  /**
   * format the given value according to the given type
   *
   * @param     {String}    type        the type: numeric/time
   * @param     {Number}    value       the value
   * @returns   {String}                value formated according to given rules
   */
  function formatValue( type, value ) {

    // null and undefined result in an empty string
    if( (typeof value == 'undefined') || (value === null)){
      return '';
    }

    switch( type ) {

      // for numeric, we do nothing
      case 'numeric': return '' + value;

      // times get formatted
      case 'time':    let d = Moment( value );
                      return d.format( localCfg.dateFormatMoment );

      // everything else is an error
      default: throw new Error( 'Unknown type: ' + type );

    }

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

    // find some more items
    $els.resultList     = $content.find( '.collist' );

    // find some templates
    $templ.resultItem = $content.find( '#constructResItem' ).contents();
    $templ.numeric    = $content.find( '#constructResColNumeric' ).contents();
    $templ.codelist   = $content.find( '#constructResColCodelist' ).contents();

    // init readmore button for codelist values
    $content.on( 'click', '.readmore', function(){
      $( this ).closest( '.val' ).addClass( 'full' );
    });

    // return global function pointers
    return {
      update: update
    };

  }

});