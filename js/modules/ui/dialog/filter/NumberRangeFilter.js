"use strict";
/*
 * provide the interface for for filtering numbers by given range
 */
define( ['jquery',
         'jquery-ui',
         'ui/basic/Yavaa.global',
         'text!template/ui/dialog/filter/NumberRangeFilter.htm',
         'ui/basic/Overlay'
         ],
function( $,
    jqueryUI,
    Y,
    templ,
    Overlay
){

  // prepare content
  var $content = $( templ );

  // links to elements
  var $els = {
      sliderCont : $content.find( '#slider' ),
      minVal: $content.find( '.values[data-type="min"]' ),
      maxVal: $content.find( '.values[data-type="max"]' )
  };

  // attach change handler
  $els.minVal.on( 'change keyup', changeHandler );
  $els.maxVal.on( 'change keyup', changeHandler );

  // TODO needs to be adapted to the actual dataset
  // stepping width
  const stepWidth = 0.01;

  // currently used range
  let range;

  /**
   * @params  {jQuery}    dialogContainer     the container element, where to put the content
   * @params  {Dataset}   ds                  the currently active dataset
   * @params  {Number}    cold                the column to be filtered
   * @returns
   */
  function NumberRangeFilter( dialog, dialogContainer, ds, col ) {

    // save parameters
    this._dialog = dialog;
    this._dialogContainer = dialogContainer;
    this._ds = ds;
    this._col = col;

  }


  /**
   * initialize
   */
  NumberRangeFilter.prototype.init = async function init(){

    // set base content
    this._dialogContainer.html( $content );

    // activate overlay
    var overlay = new Overlay( $els.sliderCont );

    // get the values
    const values = await this._col.getColumnValues()

    // convert to numbers
    values.min = +values.min;
    values.max = +values.max;

    // store reference to values
    range = values;

    // set values
    $els.minVal.attr( 'min', values.min )
               .attr( 'max', values.max )
               .attr( 'step', stepWidth )
               .val( values.min );
    $els.maxVal.attr( 'min', values.min )
               .attr( 'max', values.max )
               .attr( 'step', stepWidth )
               .val( values.max );

    // activate slider
    $els.sliderCont.slider({
      range:  true,
      min:    values.min,
      max:    values.max,
      step:   stepWidth,
      values: [ values.min, values.max ],
      slide: ( event, ui ) => {

        // get current select values
        const val = ui.values;

        // update fields
        $els.minVal.val( val[0] );
        $els.maxVal.val( val[1] );

        // update buttons
        this._afterChange();

      }
    });

    // update buttons
    this._afterChange();

    // remove overlay
    overlay.remove();

  }


  /**
   * is the current result really a filter to apply?
   * (in contrast to a filter, which has no effect)
   */
  NumberRangeFilter.prototype.hasEffect = function(){

    // get current select values
    const lower = parseFloat( $els.minVal.val() ),
          upper = parseFloat( $els.maxVal.val() );

    // effect, when either value has changed
    return (lower != range.min) || (upper != range.max);

  }


  /**
   * return the respective filter command for the current settings
   */
  NumberRangeFilter.prototype.getFilterRule = function(){

    // get current select values
    const val = $els.sliderCont.slider( 'values' );

    // return filter rule
    return {
        'operator': 'NumberRangeFilter',
        'include': true,
        'column': this._col.getID(),
        'values': {
          'min': val[0],
          'max': val[1]
        }
    };

  }


  /**
   * enable or disable the apply button after each change
   */
  NumberRangeFilter.prototype._afterChange = function afterChange(){

    if( this.hasEffect() ) {
      this._dialog.setDisabled( 'Apply', false );
    } else {
      this._dialog.setDisabled( 'Apply', true );
    }

  }

  /**
   * change handler for min and max field
   */
  function changeHandler(){

    // shortcut
    const $this = $(this);

    // set value in slider
    if( $this.data('type') == 'min' ) {
      $els.sliderCont.slider( 'values', 0, $this.val() );
    } else {
      $els.sliderCont.slider( 'values', 1, $this.val() );
    }

  }

  return NumberRangeFilter;

});