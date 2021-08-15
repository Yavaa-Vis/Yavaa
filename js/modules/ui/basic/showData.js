define( ['basic/error'], function( error ){


	/**
	 * creates new table rows and cells and inserts them into the element specified by target afterwards
	 */
	function insertCells( target, data ) {

		var result = '',	// intermediate HTML code
  			i,	j,			// loop variables
  			targetEl = document.querySelector( target );	// DOM element into which to insert the cells

		// wrong target
		if( !targetEl ) {
			// TODO error msg
			return;
		}

		// all rows
		for( i=0; i<data.length; i++ ) {

			result += '<tr>';

			// all cells
			for( j=0; j<data[i].length; j++ ) {
				result += '<td>' + data[i][j] + '</td>';
			}

			result += '</tr>';
		}

		// insert into target
		targetEl.innerHTML = result;
	}


	/**
	 * creates the table header
	 */
	function insertHead( target, data ) {
    var result = '',  // intermediate HTML code
        i,            // loop variable
        targetEl = document.querySelector( target );  // DOM element into which to insert the cells

    // wrong target
    if( !targetEl ) {
      // TODO error msg

      return;
    }

    data = data['columns'];
    
    // all rows
    result += '<tr>';
    for( i=0; i<data.length; i++ ) {

      result += '<th>' + data[i]['label'] + '</th>';

    }
    result += '</tr>';

    // insert into target
    targetEl.innerHTML = result;


	}

	return {
		'insertCells': insertCells,
		'insertHead' : insertHead
	};
});