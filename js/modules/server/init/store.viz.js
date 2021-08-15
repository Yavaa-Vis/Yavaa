"use strict";
/**
 * initialize the list of visualisation descriptions
 *
 * *** JUST RUN ON SERVER ***
 *
 */
module.exports = function(){

  // includes
  const Fs    = require( 'fs' ),
        Path  = require( 'path' );

  // config
  const cfg = {
      appBase:    Path.join( __dirname, '..', '..' ),
      vizModule:  'viz/'
  };

  // setup requirejs (needed to read the viz descriptions)
  var RequireJS = require( Path.join( __dirname, '..', '..', '..', '..', 'lib', 'requirejs', 'r' ) );
  RequireJS.config({
    'baseUrl': cfg.appBase
  });

  // load list of available descriptions from file system
  const list = Fs.readdirSync( Path.join( cfg.appBase, cfg.vizModule ) )
                 .filter( ( filename ) => filename.includes( '.desc.js' ) )
                 .map( ( filename ) => filename.replace( '.desc.js', '' ) );

  // modules to be loaded
  const modules = list.map( function( filename ){
                       return cfg.vizModule + filename + '.desc';
                     });
  modules.unshift( 'basic/Constants' );

  // it's an async operation, but we have no easy access to util/requirePromise here
  return new Promise( (resolve, reject) => {

    try {

      // load descriptions
      RequireJS( modules, function(){

        // extract loaded modules
        const descriptions  = Array.prototype.slice.call( arguments, 1 ),
              Constants     = arguments[0];

        // create basic info for all visualizations
        const info = [];
        for( let i=0; i<list.length; i++ ){

          for( var j=0; j<descriptions[i].length; j++ ) {

            // shortcut
            const binding = descriptions[i][j];

            // check validity
            if( !checkValidity( binding, list[i] ) ){
              continue;
            }

            // get amount of columns and see, if there is a multivalue column
            let hasMulCol     = false,
                hasNestedViz  = false,
                hasOptional   = false,
                hasArray      = false,
                colCount      = 0;
            for( let col of binding['columnBinding'] ) {
              hasMulCol     = hasMulCol     || col['isarray'];
              hasNestedViz  = hasNestedViz  || (col['datatype'] == Constants.VIZDATATYPE.VISUALIZATION);
              hasOptional   = hasOptional   || col.optional;
              hasArray      = hasArray      || col.isarray;
              colCount      += ((col['datatype'] == Constants.VIZDATATYPE.VISUALIZATION) || col['optional'] )
                                ? 0 : 1;
            }

            // insert into result list
            info.push([
              list[i],       // ID of the viz
              j,             // ID of the binding inside the viz
              colCount,      // amount of columns needed
              hasMulCol,     // flag, if amount of columns is a min value
              hasNestedViz,  // flag, if there is a nested visualization; == is layout definition
              hasOptional,   // flag, if there are additional optional columns
              hasArray,      // flag, if there is at least one array-column
            ]);

          }

        }

        // write the shortened list of descriptions to file
        const path = Path.join( cfg.appBase, cfg.vizModule, '/RepoList.js' );
        Fs.writeFileSync( path,
            'define(function(){return ' + JSON.stringify(info) + ';});' );

        // log
        console.log( JSON.stringify( new Date()), 'Initializing Visualization Repository' );
        console.log( JSON.stringify( new Date()), '   Written to ' + path );

        // done
        resolve();

      });

    } catch ( e ) {

      // relay any error
      reject( e );

    }

  });

}


/**
 * checks the validity of a visualization description
 * @param desc
 * @param id
 * @returns {Boolean}
 */
function checkValidity( desc, id ) {

  // TODO
  return true;

}

// run only called directly
if (require.main === module) {
  module.exports();
}