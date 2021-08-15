"use strict";
/**
 * Wrapper for column meta data
 * Client Edition
 */
define( ['shared/types/Column',
         'ui/basic/Yavaa.global',
         'util/requirePromise',
], function( Column,
             Y,
             requireP
          ){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Complex Getter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * retrieve the distinct values for this column
   * just possible for following types:
   * - semantic
   */
  Column.prototype.getColumnValues = async function getColumnValues(){

    // check cache
    // disabled, as otherwise resolving of values would need to reset this cache,
    // which is not easily done in a consistent manner
//    if( !this._columnValues ) {

      // query worker
      const res = await Y.CommBroker
                         .execCommand({
                            'action': 'getColumnValues',
                            'params': {
                              'data_id':  this._ds.getID(),
                              'col_id':   this.getID()
                            }
                          });


        // cache
        this._columnValues = res['params']['values'];

//    }

    return this._columnValues;

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Template Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * return a jQuery object) representing this columns
   */
  Column.prototype.getTemplate = async function getTemplate() {

    // load dependencies
    const [ $, templ ] = await requireP( [ 'jquery', 'text!template/ui/common/column.htm' ] );

    // set the values necessary for this column
    const html = templ.replace( /{label}/gi, this.getLabel() )
                      .replace( /{uri}/gi,   this.getConcept() )
                      .replace( /{order}/gi, this.getID() )
    const $res = $( html );
    $res
      .data( 'col_id', this.getID() )
      .data( 'order',  this.getID() ) // duplicate for compatibility now; to be removed
      .data( 'uri',    this.getConcept() )
      .data( 'col',    this )               // this should be the reference data attribute
      .attr( 'title',  this.getLabel() )
      .addClass( this.isDimension() ? 'dimension' : 'measurement' )

    return $res;

  };

  return Column;

});