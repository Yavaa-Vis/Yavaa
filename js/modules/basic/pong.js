/**
 * Reply with just the message, that was received, plus a timestamp
 * 
 * prop structure:
 * - msg ... the message to return
 */

define( function(){
	return function( dataset, prop ) {
		return ( new Date().getTime()) + ': ' + prop['msg'];
	};
});