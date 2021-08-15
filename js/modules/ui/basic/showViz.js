define( ['basic/error'], function( error ){

  function insertViz( code ) {
    $( '#viz' ).html( code );
  }


	return {
		'insertViz': insertViz
	};
});