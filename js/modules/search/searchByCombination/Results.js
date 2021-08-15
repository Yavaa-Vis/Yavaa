"use strict";
/*
 * collect the results of the search process
 * remove/ignore duplicates and adjust filters, if necessary 
 * 
 */
define( [ 'util/deepObjectEqual'], function( deepObjectEqual ){

  function SearchResults(){
    this._datasets = [];
    this._lookup   = {};
    this._regionIdCounter = 0;
  }


  /**
   * add a dataset component to this collection
   */
  SearchResults.prototype.add = function add( ds ){
    
    // if the dataset URI is new, we just add it
    let uri = ds.cand.ds;
    if( !(uri in this._lookup) ) {
      this._lookup[ uri ] = [ ds ];
      this._datasets.push( ds );
      return true;
    }
    
    // get the list of parts for this dataset
    let collection = this._lookup[ uri ];
    
    // check, if the entry already exists
    for( let i=0; i<collection.length; i++ ) {
      if( deepObjectEqual( collection[i], ds, ['remainder', 'rating', 'regionId', 'parentRegionId' ] ) ) {
        return false;
      }
    }
    
    // if we came this far, add the dataset
    this._lookup[ uri ].push( [ ds ] );
    this._datasets.push( ds );
    return true;

  }
  
  /**
   * get a unique region id for this result set
   */
  SearchResults.prototype.createRegionId = function getRegionId(){
    return this._regionIdCounter++;
  }
  
  /**
   * get all involved datasets
   */
  SearchResults.prototype.getAll = function getAll(){
    return this._datasets;
  }


  return SearchResults;
  
});