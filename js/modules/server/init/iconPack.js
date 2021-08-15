"use strict";
/**
 * combine all icons to a single SVG to minimize load times
 *
 * *** JUST RUN ON SERVER ***
 *
 */
module.exports = async function(){

  // log
  console.log( JSON.stringify( new Date()), 'Creating icon sprite SVG' );

  // includes
  const Fs      = require( 'fs' ),
        Path    = require( 'path' ),
        Cheerio = require( 'cheerio' );

  // config
  const cfg = {
      template:     Path.join( __dirname, '..', '..', '..', '..', 'template', 'ui', 'icons.svg' ),
      folderIcons:  Path.join( __dirname, '..', '..', '..', '..', 'webRoot', 'gfx', 'icons' ),

      target:       Path.join( __dirname, '..', '..', '..', '..', 'webRoot', 'gfx', 'icons.svg' ),
  };

  // get a list of all icons
  const iconFiles = Fs.readdirSync( cfg.folderIcons ).filter( file => file.includes( '.svg' ) );

  // read template
  const $template = Cheerio.load( Fs.readFileSync( cfg.template, 'utf8' ), {
    xmlMode: true
  });

  // get some links in the template
  const $views = $template( 'g#views' ),
        $icons = $template( 'g#icons' );

  // process all icons
  let runningY = 0,
      maxX = 0;
  for( let file of iconFiles) {

    // shortcuts
    const name = file.replace( '.svg', '' );

    // read
    const $icon = Cheerio.load( Fs.readFileSync( Path.join( cfg.folderIcons, file ), 'utf8' ));

    // extract viewbox
    const viewbox = $icon( 'svg' ).attr( 'viewBox' ),
          dims = viewbox.split( ' ' );

    // adjust viewbox
    const base = parseFloat( dims[1] );
    dims[ 1 ] = base + runningY;

    // create container
    const $cont = $template( '<g />' );
    $cont.attr({
        id: name,
        transform: `translate( 0 ${runningY} )`,
      });

    // a little compression
    $icon( 'path' ).each( (i, el) => {
      const $el = $icon(el);
      $el.attr( 'd', $el.attr('d').replace( /\s+/gm, ' ' ) );
    });
    $icon('*')
      .contents()
      .filter( function(){ return (this.nodeType == 3) })
      .remove();

    // copy the SVG contents
    $cont.append( $icon( 'svg > *' ) )

    // create the view element
    const $view = $template( '<view />' );
    $view.attr({
      id: name + 'View',
      viewBox: dims.join( ' ' ),
    });

    // append result
    $views.append( $view );
    $icons.append( $cont );

    // adjust the global coordinates
    runningY += base
              + Math.abs( parseFloat( dims[ 3 ] ) )
              + 100;
    maxX = Math.max( maxX, parseFloat( dims[ 2 ] ) );

  }

  // set the global viewbox (for debugging)
  $template( 'svg' )
    .attr({
      viewBox: `0 0 ${maxX} ${runningY}`,
    });

  // write result to file
  Fs.writeFileSync( cfg.target, $template.xml() );

  // log
  console.log( JSON.stringify( new Date()), '   Written to ' + cfg.target );

}