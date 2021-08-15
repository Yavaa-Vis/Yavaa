define( [ 'store/data',
          'comp/function/RowAccessor',
        ],
function( dataStore,
          RowAccessor
){
	"use strict";

	/**
	 * execute the function given with funktion on column col_id in dataset data_id
	 * @param {Number}	        data_id		identifier of the dataset
	 * @param {Number}	        col_id		identifier of the column
	 * @param {Array[String]}   values    list of values used in funktion
	 * @param {Object}          funktion	funktion to be applied
	 */
	return function executeFunktion( data_id, col_id, values, funktion ) {

		// get old dataset
		const oldDs     = dataStore['getDataset']( data_id ),
		      oldCol    = oldDs.getData()[ col_id ],
		      oldLength = oldDs.getRowCount();

		// get row accessor
		const accessor = new RowAccessor( oldDs, values, col_id );

		return new Promise( (resolve, reject) => {

	    // apply funktion
	    let doneElements = 0,
	        newCol = [];
	    setTimeout( doApply, 0 );

	    /**
	     * actual applying funktion
	     * written for execution in segments
	     */
	    function doApply(){

	      // how many items in this iteration?
	      const max = Math.min( 100, oldLength - doneElements );

	      // process the next rows
	      for( let i=0; i<max; i++ ) {
	        if( !oldCol || oldCol[ doneElements ] ) {
	          const values = accessor.get( doneElements );
	          newCol.push( funktion( values ) );
	        } else {
	          newCol.push( oldCol[ doneElements ] );
	        }
	        doneElements += 1;
	      }

	      if( doneElements >= oldLength ) {

	        // finished all elements
	        resolve( newCol );

	      } else {
	        // still some way to go

	        // report progress
	        // TODO fix without using Q.notify()
	        /*
	        result['notify']( {
	          'action': 'progress',
	          'params': {
	            'progress': (doneElements / oldCol.length).toFixed( 4 )
	          }
	        });
	        */

	        // schedule next iteration
	        setTimeout( doApply, 0 );
	      }

	    }

		});

	};

});