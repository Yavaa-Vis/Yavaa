"use strict";
/**
* Convert a given dataset into a tree like structure
*
* (can't use Map here as the value instances differ for each dataset)
*/
define( [], function(){

  /**
   * @param  {Object}            ds      the dataset to process
   * @param  {Array[Number]}     dims    the indexes of the dimension columns, which will be used
   */
  function SearchTree( ds, dims ) {
    this._ds = ds;
    this._dims = dims || [];
    this._tree = {};
  }


  /**
   * built the tree structure
   */
  SearchTree.prototype.init = function(){

    let runner, key, row;

    // get number of data rows
    const rowCount  = this._ds.getRowCount();

    // short-circuit: if no dimensions are given, we just have a complete list of rows
    // short-circuit: now rows, empty list
    if( (this._dims.length < 1) || (rowCount < 1) ) {
      this._tree = [];
      for( let i=0; i<rowCount; i++ ) {
        this._tree.push( i );
      }
      return;
    }

    // last index
    const lastCol = this._dims[ this._dims.length - 1 ];

    // walk the dataset
    for( let line=0; line<rowCount; line++ ) {

      // get data row
      row = this._ds.getRow( line );

      // we always start on top of the tree
      runner = this._tree;

      // find the respective subtree
      for( let i=0; i<this._dims.length-1; i++ ) {

        // get respective key (in String format)
        key = getKey( row[ this._dims[i] ] );

        // make sure there is a subtree for that key
        if( !(key in runner) ) {
          runner[ key ] = {};
        }

        // go a level down
        runner = runner[key];
      }

      // make sure, there is something to hold the line number
      key = getKey( row[ lastCol ] );
      if( !(key in runner) ){
        runner[ key ] = [];
      }

      // remember the line from the dataset
      runner[ key ].push( line );

    }

    // init iterator
    this.reset();

  };



  /**
   * return a list of matching rows
   * @param  {Array}   values    one set of dimension values to look for; same order as in constructor
   */
  SearchTree.prototype.match = function( values ) {

    let key;

    // find the respective array of line numbers
    let runner = this._tree;
    for( let i=0; i<values.length; i++ ) {

      key = getKey( values[i] );

      // do we have such a value
      if( !(key in runner) ) {
        return [];
      }

      // walk further
      runner = runner[ key ];

    }

    return runner;
  }


  /*
   * convert object to string key; basically a hash
   * needed so "different" objects pointing to the same value,
   * e.g., semantic entities, are recognised as identical
   */
  function getKey( obj ) {
    if( obj ) {
      return obj.hash();
    } else {
      return '';
    }
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Iteration XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * is there still a next leaf
   */
  SearchTree.prototype.hasNext = function hasNext(){

    if( (this._iterator == null) || (typeof this._iterator == 'undefined') ) {

      // there is no next element
      return false;

    } else {

      // there is still some element left
      return true;

    }

  }

  /**
   * return the next leaf
   */
  SearchTree.prototype.next = function next() {

    // no elements left
    if( (this._iterator == null) || (typeof this._iterator == 'undefined') ) {
      return false;
    }

    // current return value
    let retVal = this._tree;
    for( let i=0; i<this._iterator.length; i++ ) {
      retVal = retVal[ this._iterator[i][ this._iterator[i].length - 1 ] ];
    }

    // determine next value
    this._nextLeaf( this._iterator.length - 1 );

    // return current value
    return retVal;

  }

  /**
   * search for the next child at the given level
   * if one is found, return true
   * if none is found, trigger the same process on the parent level and relay the result
   * @param level
   * @returns {Boolean}
   */
  SearchTree.prototype._nextLeaf = function _nextLeaf( level ){

    // remove the link to the current leaf as there are no more children left
    this._iterator[ level ].pop();

    // does the current node still have other children? => done
    if( this._iterator[ level ].length > 0 ) {
      return true;
    }

    // are we already at the root node? => delete iterator
    if( level == 0 ) {
      this._iterator = null;
      return false;
    }

    // do the same one level up
    const moreKids = this._nextLeaf( level - 1 );

    // if we still have kids, repopulate this level
    if( moreKids ) {

      // find the current parent node
      let parent = this._tree;
      for( let i=0; i<level; i++ ) {
        parent = parent[ this._iterator[i][ this._iterator[i].length - 1 ] ];
      }

      // set the new list of child keys
      this._iterator[ level ] = Object.keys( parent ).reverse();

      return true;
    }

    // if we came this far, there are no more leafs left
    return false;

  }


  /**
   * reset the iterator
   */
  SearchTree.prototype.reset = function reset(){

    // reset iterator
    this._iterator = [];

    // walk the tree
    let runner = this._tree;

    // until we get to a leaf
    while( !(runner instanceof Array) ) {

      // push current keyset for iterator
      const newKeys = Object.keys( runner )
      this._iterator.push( newKeys.reverse() );

      // next level
      runner = runner[ newKeys[ newKeys.length - 1 ] ];
    }

  }


  return SearchTree;
});