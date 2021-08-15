"use strict";
/*
 * provide the interface for filtering dates by given range
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/filter/DateRangeFilter.htm',
         'ui/basic/Overlay',
         'moment'
         ],
function( $,
    jqueryUI,
    Y,
    templ,
    Overlay,
    moment
){

  // prepare content
  const $content = $( templ );

  // links to elements
  const $els = {
      sliderCont : $content.find( '#slider' ),
      minVal: $content.find( '.values[data-type="min"]' ),
      maxVal: $content.find( '.values[data-type="max"]' )
  };

  // currently used range
  let storage,
      curValues;

  /**
   * @param  {jQuery}    dialogContainer     the container element, where to put the content
   * @param  {Dataset}   ds                  the currently active dataset
   * @param  {Number}    cold                the column to be filtered
   * @returns
   */
  function DateRangeFilter( dialog, dialogContainer, ds, col ) {

    // save parameters
    this._dialog = dialog;
    this._dialogContainer = dialogContainer;
    this._ds = ds;
    this._col = col;

  }


  /**
   * initialize
   */
  DateRangeFilter.prototype.init = async function init(){

    // set base content
    this._dialogContainer.html( $content );

    // activate overlay
    var overlay = new Overlay( $els.sliderCont );

    // get the values
    const values = await this._col.getColumnValues();

    // convert to numbers
    values.min = +values.min;
    values.max = +values.max;

    // determine step amount
    const minDate = moment( values.min ),
          maxDate = moment( values.max );
    let unit;
    switch( values.detail ) {
      case 0: unit = 'years';          break;
      case 1: unit = 'months';         break;
      case 2: unit = 'days';           break;
      case 3: unit = 'hours';          break;
      case 4: unit = 'minutes';        break;
      case 5: unit = 'seconds';        break;
      case 6: unit = 'milliseconds';   break;
    }
    const steps = maxDate.diff( minDate, unit );

    // date format
    // TODO align this and the parsing in /load/parser/SimpleDateParser
    let format;
    switch( values.detail ) {
      case 0: format = 'YYYY';                      break;
      case 1: format = 'YYYY MMM';                  break;
      case 2: format = 'YYYY-MM-DD';                break;
      case 3: format = 'YYYY-MM-DD HH:00:00';       break;
      case 4: format = 'YYYY-MM-DD HH:mm:00';       break;
      case 5: format = 'YYYY-MM-DD HH:mm:ss';       break;
      case 6: format = 'YYYY-MM-DD HH:mm:ss.SSS';   break;
    }

    // set values
    $els.minVal.val( minDate.format( format ) );
    $els.maxVal.val( maxDate.format( format ) );

    // store reference to values
    storage = {
        min: 0,
        max: steps,
        base: minDate,
        unit: unit
    };

    // activate slider
    curValues = [ 0, steps ];
    $els.sliderCont.slider({
      range: true,
      min: 0,
      max: steps,
      values: [ 0, steps ],
      slide: ( event, ui ) => {

        // get current select values
        curValues = ui.values;

        const upperBorder = minDate.clone().add( curValues[1], unit ),
              lowerBorder = minDate.clone().add( curValues[0], unit );

        // update shown fields
        $els.minVal.val( lowerBorder.format( format ) );
        $els.maxVal.val( upperBorder.format( format ) );

        // update apply button
        this._afterChange();
      }
    });

    // enable/disable buttons
    this._afterChange();

    // remove overlay
    overlay.remove();

  }

  /**
   * is the current result really a filter to apply?
   * (in contrast to a filter, which has no effect)
   */
  DateRangeFilter.prototype.hasEffect = function(){

    // effect, when either value has changed
    return (curValues[0] != storage.min) || (curValues[1] != storage.max);

  }


  /**
   * return the respective filter command for the current settings
   */
  DateRangeFilter.prototype.getFilterRule = function(){

    // get current select values
    const val = $els.sliderCont.slider( 'values' );

    // calculate min and max values
    const upperBorder = storage.base.clone().add( val[1], storage.unit ),
          lowerBorder = storage.base.clone().add( val[0], storage.unit );

    // return filter rule
    return {
        'operator': 'DateRangeFilter',
        'include': true,
        'column': this._col.getID(),
        'values': {
          'min': lowerBorder.valueOf(),
          'max': upperBorder.valueOf()
        }
    };

  }

  /**
   * enable or disable the apply button after each change
   */
  DateRangeFilter.prototype._afterChange = function afterChange(){

    if( this.hasEffect() ) {
      this._dialog.setDisabled( 'Apply', false );
    } else {
      this._dialog.setDisabled( 'Apply', true );
    }

  }

  return DateRangeFilter;

});