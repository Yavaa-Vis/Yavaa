"use strict";

/*
 * defines an entry for the workflow
 * is attached to a specific data item
 */

define( [], function(){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Constructor XXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function WorkflowEntry( data ){

    Object.defineProperty( this,
                           '_data',
                           { 'value': data } );

  }


  /**
   * retrieve part of the workflow data
   * @param   {String}    path      the path to the respective item
   * @return  {*}                   the respective item
   */
  WorkflowEntry.prototype['getData'] = function( path ) {

    // split the path
    var p = path.split('/');

    // retrieve item
    var ref = this['_data'];
    for( var i=0; i<p.length; i++ ) {
      if( p[i] in ref ) {
        ref = ref[ p[i] ];
      } else {
        return;
      }
    }

    return ref;
  }


  /**
   * get all saved data
   */
  WorkflowEntry.prototype['getAllData'] = function(){
    return this['_data'];
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Export XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  return WorkflowEntry;

});