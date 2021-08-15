define( [ 'config/server' ], function( ServerCfg ) {

	// container for logging
	let logContainer;

	function LoggerEnabled( msg, isOutMessage ) {

		// select the message type's according CSS class
	  let text, className;
		switch( msg['action'] ) {

		  case 'error':
        className = 'error';
				text = '<b>' + msg.params['src'] + '</b>: ' + msg.params['msg'] + '<br><pre>' + htmlEscape(msg.params['stack'] || '') + '</pre>';
				break;

			default:
			  className = 'undef';
	      text = htmlEscape( JSON.stringify( msg, function(key, value){
	        switch( typeof value ){
	          case 'string': return value.substring( 0, 500 );
	          case 'object': if( value instanceof Array ) {
	                           return value.slice( 0, 20 );
	                         }
	          default: return value;
	        }
	      } ) );
		};

		// check whether msg comes from the worker or goes to it
		className = isOutMessage ? ' outMsg' : ' inMsg';

		// build the HTML
		const html = '<div class="' + className + '">' + text + '</div><hr>';

		// insert HTML
		logContainer.innerHTML = html + logContainer.innerHTML;
	};


	// http://stackoverflow.com/a/7124052/1169798
	function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\r?\n|\r/g, "\n" );
	}

	function LoggerDisabled(){}



	// if we have a log-target present, return LoggerEnabled, else LoggerDisabled
	if( document ) {

    // remember logging container element
    logContainer = document.querySelector( '#log' );

	  if( ServerCfg.isProduction ) {

	    // remove the logging container
	    logContainer.parentNode.removeChild( logContainer );

	    return LoggerDisabled;

	  } else {

	    return LoggerEnabled;
	  }

	} else {

	  return LoggerDisabled;

	}

});