"use strict";
/**
 * initialize the list of aggregation functions
 *
 * *** JUST RUN ON SERVER ***
 *
 */
module.exports = function(){

  // includes
  var Fs   = require( 'fs' ),
      Path = require( 'path' );

  // config
  var cfg = {
      appBase:    Path.join( __dirname, '..', '..' ),
      serverBase: Path.join( __dirname, '..', '..', '..', '..' ),
      module:     'comp/aggregate/',

      // list of template files to augment with option list
      templOptions: [
        'ui/dialog/aggregate/columnwrapper.server.htm',
        'ui/dialog/constructDataset/tabAdjust_entry_aggcol.server.htm'
      ]

  };

  // setup requirejs (needed to read the descriptions)
  const RequireJS = require( Path.join( __dirname, '..', '..', '..', '..', 'lib', 'requirejs', 'r' ) );
  RequireJS.config({
    'baseUrl': cfg.appBase
  });

  // load list of available descriptions from file system
  const list = Fs.readdirSync( Path.join( cfg.appBase, cfg.module ) )
                 .filter( function( filename ){
                   return filename.lastIndexOf( '.desc.js' ) == ( filename.length - 8);
                 })
                 .map( function( filename ){
                   return filename.substring( 0, filename.length - 8 );
                 });

  // modules to be loaded
  const modules = list.map( function( filename ){
                       return cfg.module + filename + '.desc';
                     });

  // it's an async operation, but we have no easy access to util/requirePromise here
  return new Promise( (resolve, reject) => {
    try {

      // load descriptions
      RequireJS( modules, function(){

        // log
        console.log( JSON.stringify( new Date()), 'Initializing Computation/Aggregation function list' );

        // extract loaded modules
        const descriptions = Array.prototype.slice.call( arguments, 0 );

        // create basic info for all aggregations
        const info = [];
        for( var j=0; j<descriptions.length; j++ ) {

          // shortcut
          var desc = descriptions[j];

          // check validity
          if( !checkValidity( desc ) ){
            continue;
          }

          // augment with module name
          desc['module'] = list[j];

          // add to result
          info.push( desc );

        }

        // write the shortened list of descriptions to file
        const path = Path.join( cfg.appBase, cfg.module, 'FunctionList.js' );
        Fs.writeFileSync( path, 'define(function(){return ' + JSON.stringify(info) + ';});' );
        console.log( JSON.stringify( new Date()), '   Written Computation/Aggregation function list to ' + path );

        // option template file
        const templ_path = Path.join( cfg.serverBase, 'template', 'ui', 'dialog', 'aggregate', 'columnwrapper_option.server.htm'),
              templ_opt = Fs.readFileSync( templ_path, 'utf8' );

        // create all options for insert into column template
        const opt = [];
        for( var i=0; i<info.length; i++ ) {

          const entry = templ_opt .replace( /{module}/gi,   info[i].module )
                                .replace( /{name}/gi,     info[i].name )
                                .replace( /{datatype}/gi, info[i].datatype.join( ' ' ) )
                                .replace( /{selected}/gi, info[i].defaultOption ? 'selected="selected"' : '' );

          opt.push( entry );

        }

        // process respective templates
        cfg.templOptions
           .forEach( (path) => {

             // load template
             const templPath  = Path.join( cfg.serverBase, 'template', path );
             let   templ      = Fs.readFileSync( templPath, 'utf8' );

             // augment with option list
             templ = templ.replace( /{options}/gi, opt.join('') );

             // create new path
             const newPath = path.replace( /\.server\./gi, '.' );

             // write to filesystem
             const targetPath = Path.join( cfg.serverBase, 'template', newPath );
             Fs.writeFileSync( targetPath, templ );

             // log
             console.log( JSON.stringify( new Date()), '   written ' + newPath );

           });

        // log
        console.log( JSON.stringify( new Date()), '   ... done' );

        // done
        resolve();

      });

    } catch( e ) {

      // relay error
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