"use strict";
/**
 * Provide access to the helper functions
 */
define( [ 'store/data',
          'util/requirePromise'],
function( Datastore,
          requireP
){

  return {
    'suggestJoin':         suggestJoin,
  };


  /**
   * for two given datasets, suggest a possible join condition
   */
  async function suggestJoin( param ) {

    // try to get involved datasets
    const ds1 = Datastore.getDataset( +param.data_id1 ),
          ds2 = Datastore.getDataset( +param.data_id2 );

    // check for errors
    if( !ds1 || !ds2 ) {
      throw new Error( 'Invalid datasets!' );
    }

    // get the helper function
    const helper = await requireP( 'helper/suggestJoin' );

    // run it
    const res = await helper( ds1, ds2 );

    // return the result
    return {
      'action': 'suggestedJoin',
      'params': {
        'data_id1':   ds1.getID(),
        'data_id2':   ds2.getID(),
        'join_cond':  res,
      }
    };
  }

});