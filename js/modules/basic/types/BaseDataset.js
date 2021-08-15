"use strict";
/**
 * internal representation of a BaseDataset
 */
define( [ 'basic/types/Column',
          'basic/types/Null',

        ],
function( Column,
          Null
        ){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Constructor XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * @constructor
   */
  function BaseDataset(){}


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX findDistinctValues XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * prepare a description of the distinct values for a given column or all columns
   */
  BaseDataset.prototype['findDistinctValues'] = function( col ){

    if( typeof col == 'undefined' ) {
      // no column specified, so do it for all
      const columns = this.getColumnMeta();
      for( let col of columns ){
        this.findDistinctValues( col );
      }
      return;
    }

    // get id of the respective column
    let col_id;
    if( typeof col == 'number' ) {

      // error for invalid column id
      if( col >= this.getColumnCount() ) {
        throw new Error( 'Invalid column id: ' + col );
        return;
      }

      // valid column id
      col_id = col;

    } else if ( col instanceof Column ) {

      // Column object
      col_id = col.getID();

    } else {

      // unknown type
      throw new Error( 'Invalid column: ' + col );
      return;

    }
    const col_meta = this.getColumnMeta( col_id );

    // short circuit, if distinct values are already present
    if( col_meta.getDistinctValues() != null ) {
      return;
    }

    // get link to respective column
    const data = this.data[ col_id ];

    // if the dataset does not contain data, we are done here
    if( data.length < 1 ) {

      distValues = { 'hasNull': null, 'min': null, 'max': null, list: [] };
      col_meta.setDistinctValues( distValues );
      return;

    }

    // find first not null element
    var firstValIndex = -1;
    while( (firstValIndex < data.length)
           && (!(data[ firstValIndex ]) || (data[ firstValIndex ] instanceof Null)) ) {
      firstValIndex += 1;
    }

    // initialize distinct values object with values from the first non-null value
    var distValues = {
        'list':     new Set([ data[firstValIndex] ]),
        'min':      data[firstValIndex],
        'max':      data[firstValIndex],
        'hasNull':  (firstValIndex > 0)
    };

    // walk over all entries
    let val;
    for( let row=data.length-1; row>=firstValIndex; row-- ) {

      // shortcut
      val = data[row];

      // skip nulls
      if( !val || (val instanceof Null) ) {
        distValues['hasNull'] = true;
        continue;
      }

      switch( val['_type'] ) {

        // enumeration types
        case 'SemEntity':
        case 'String':
          distValues['list'].add( val );
          break;

        // hybrids
        case 'TimeInstant':
          distValues['list'].add( val );
          // no break on purpose; here we need both list and min/max

        // comparable types
        default:

          // min
          if( val.compare( distValues['min'] ) < 0 ) {
            distValues['min'] = val;
          }

          // max
          if( val.compare( distValues['max'] ) > 0 ) {
            distValues['max'] = val;
          }

      }

    }

    // add distinct values to respective column meta
    if( firstValIndex >= data.length ) {

      // no non-null values present
      distValues = { 'hasNull': true, 'min': null, 'max': null, list: [] };

    } else {

      // set to array
      distValues.list = [ ... distValues.list ];

      switch( val['_type'] ) {

        // enumeration types
        case 'SemEntity':
        case 'String':
          delete distValues.min;
          delete distValues.max;
          break;

        // hybrids
        case 'TimeInstant':
          // nothing
          break;

        // comparable types
        default:
          delete distValues.list;

      }

    }
    col_meta.setDistinctValues( distValues );

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getMetaCopy XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype['getMetaCopy'] = function(){
    // deep clone meta object
    return deepCopy( this.meta );
  };

  function deepCopy( val ) {

    // if object has a clone method itself, use it
    if ( ('clone' in val) && (typeof val['clone'] == 'function') ) {
      return val.clone( true );
    }

    // else clone manually
    var res;
    if( val instanceof Array ) {
      res = [];
    } else {
      res = {};
    }

    // attributes
    var keys = Object.keys( val );
    for( var i=keys.length; i--; ) {
      if( val[ keys[i] ] instanceof Object ) {
        // objects have to be cloned
        res[ keys[i] ] = deepCopy( val[ keys[i] ] );
      } else {
        // simple types can be copied
        res[ keys[i] ] = val[ keys[i] ];
      }
    }

    // return
    return res;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ID XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype['getID'] = function(){
    return this._ID;
  };

  BaseDataset.prototype['setID'] = function( id ){
    this._ID = id;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getMeta XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype['getMeta'] = function(){
    return this.meta;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getData XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype['getData'] = function(){
    return this.data;
  };

  BaseDataset.prototype['getDataRows'] = function(){
    return this.getPartialData( 0, this.getRowCount() );
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getRow XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype['getRow'] = function( row ){
    throw new Error( 'Unimplemented method "getRow"!' );
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getRowCount XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype['getRowCount'] = function(){
    throw new Error( 'Unimplemented method "getRowCount"!' );
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getColCount XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype['getColCount'] = function(){
    return this['meta']['columns'].length;
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getColumnMeta XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return one or all column meta objects for this dataset
   */
  BaseDataset.prototype['getColumnMeta'] = function( id ){
    if( typeof id == 'number' ){
      return this['meta']['columns'][ id ] || null;
    } else {
      return this['meta']['columns'].slice( 0 );
    }
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX getPartialData XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype['getPartialData'] = function( start, entries ){
    throw new Error( 'Unimplemented method "getRow"!' );
  };

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Serializing XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  BaseDataset.prototype.toString = function(){
    return '[Object Dataset]';
  }
  const Util = require( 'util' );
  BaseDataset.prototype[ Util.inspect.custom ] = BaseDataset.prototype.toString;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  return BaseDataset;

});