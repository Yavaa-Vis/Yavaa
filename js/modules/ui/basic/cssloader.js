/**
 * add a css file to the UI
 */
define( ['config/ui/config'], function( cfg ){

	return function( url ) {
		if ( document ) {
		    var link = document.createElement("link");
		    link.type = "text/css";
		    link.rel = "stylesheet";
		    link.href = cfg.cssBaseDir + url + '.css';
		    document.getElementsByTagName("head")[0].appendChild(link);
		}
	};
});