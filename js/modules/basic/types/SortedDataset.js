"use strict";
/**
 * internal representation of a dataset
 */
define( ['basic/error',
         'basic/types/BaseDataset'
        ],
function( Error,
          BaseDataset
        ){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Constructor XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * @constructor
   * @param   {Dataset}   base      the dataset this sorting is based upon
   * @param   {Array}     sorting   array of the columns to sort by; referencing columns in the base dataset
   */
  const SortedDataset = function SortedDataset( base, sorting ){

    // link to base dataset
    this._base = base;

    // save sorting order
    this._sorting = sorting;

    // init the sorted object
    this._sortedOrder = null;

    // reference base's (meta) data
    this['meta'] = base.getMeta();
    this['data'] = base.data;

  };

  // inherit from BaseDataset
  SortedDataset.prototype = new BaseDataset();
  SortedDataset.prototype.constructor = SortedDataset;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX sort() XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * apply the given sorting
   */
  SortedDataset.prototype['sort'] = async function sort(){

    // get the size of the dataset to order
    const size = this._base.data[0].length;

    // get smallest array type possible
    let constr = null;
    if( size < Math.pow( 2, 8 ) ) {
      constr = Uint8Array;
    } else if( size < Math.pow( 2, 16 ) ) {
      constr = Uint16Array;
    } else if ( size < Math.pow( 2, 32 ) ) {
      constr = Uint32Arry;
    } else {
      // we have no size, that fits
      throw new Error( 'basic/types/SortedDataset', 'Too many items in Dataset: ' + size );
    }

    // init sorted array
    this._sortedOrder = new constr( size );

    // init the sortedOrder array
    for( let i=0; i<size; i++ ) {
      this._sortedOrder[i] = i;
    }


    // build sorting function
    let source = '"use strict";var comp = 0;';
    for( var i=0; i<this._sorting.length; i++ ) {

      source += 'comp = '
              + ( this._sorting[i].asc ? '' : '-' )
              + 'this._tmpDs[' + this._sorting[i].col + '][ a ].compare( this._tmpDs[' + this._sorting[i].col + '][ b ] );'
              + 'if( comp != 0 ) { return comp; }';

    }
    source += 'return 0;';
    this._compFunction = new Function( 'a', 'b', source );

    // shortcut to the actual dataset
    this._tmpDs = this._base.data;

    // do sort
    Array.prototype.sort.apply( this._sortedOrder, [this._compFunction.bind( this )] );

    // clean temp vars
    this._compFunction = undefined;
    this._tmpDs = undefined;

    // resolve and return result
    return {
      'msg': 'sorted'
    };
  };


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getData XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  SortedDataset.prototype['getData'] = function(){
    return this.getPartialData( 0, this._base.data[0].length );
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getPartialData XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  SortedDataset.prototype['getPartialData'] = function( start, entries ){

    // local variables
    const res = [],
          line = [];

    // get maximum index of retrieved item; length of data array is upper border
    const max = Math.min( this._sortedOrder.length, start+entries );

    // prepare data
    for( let i=start; i<max; i++ ) {

      // reset tmp variable
      line.length = 0;

      for( let j=0; j<this._base.data.length; j++ ) {
        line.push( this._base.data[j][ this._sortedOrder[i] ] );
      }

      res.push( line );
    }

    return res;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */


  return SortedDataset;
});