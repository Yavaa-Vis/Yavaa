"use strict";
/**
 * Defines a large Boolean array with the help of typed arrays
 *
 * - size has to be given upfront
 * - values are initialized with false
 * - does not include error checking etc
 * - slower than default array
 * - indices only 32bit integer
 *
 */
define( function(){

  // mask to get value from number
  const masks = [
    1 << 0,
    1 << 1,
    1 << 2,
    1 << 3,
    1 << 4,
    1 << 5,
    1 << 6,
    1 << 7,
  ];

  return class LargeBooleanArray {

    constructor( size ){

      // remember the size as the array might have a few slots to much
      this._size = size;

      // init the data holding structure
      this._data = new Uint8ClampedArray( this._index( size ) + 1 );

    }

    /**
     * set true on all given indices
     */
    set( ... indices ) {
      for( const i of indices ) {
        this._data[ this._index(i) ] |= this._mask( i );
      }
    }

    /**
     * set false on all given indices
     */
    del( ... i ) {
      for( const i of indices ) {
        this._data[ this._index(i) ] &= 255 - this._mask( i );
      }
    }

    /**
     * get value for given index
     */
    get( i ) {
      return !!(this._data[ this._index(i) ] & this._mask( i ));
    }

    /**
     * emit all true indices
     */
    * trueIterator(){
      for( let i=0; i<this._data.length; i++ ) {
        for( let j=0; j<8; j++ ) {
          if( !!(this._data[ i ] & masks[ j ]) ) {
            // calc original index
            const index = i * 8 + j;
            // only emit, if in bounds
            if( index < this._size ) {
              yield index;
            }
          }
        }
      }
    }


    /**
     * emit all false indices
     */
    * falseIterator(){
      for( let i=0; i<this._data.length; i++ ) {
        for( let j=0; j<8; j++ ) {
          if( !!!(this._data[ i ] & masks[ j ]) ) {
            // calc original index
            const index = i * 8 + j;
            // only emit, if in bounds
            if( index < this._size ) {
              yield index;
            }
          }
        }
      }
    }

    _index( i ) {
      return (i / 8) | 0;
    }
    _mask( i ) {
      return masks[ i % 8 ];
    }

  }

});