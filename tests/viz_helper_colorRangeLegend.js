/**
 * basic testing of viz/helper/colorRangeLegend
 * only server-based
 *
 * stores the results in /tests/vizResults
 *
 */
define( [ 'module',
          'basic/Constants',
          'viz/helper/colorRangeLegend',
          'd3',
          'jsdom',
          'util/requirePromise',
          'text!template/viz/General.d3.tpl.htm'
], function( module,
             Constants,
             colorRangeLegend,
             d3,
             jsdom,
             requireP,
             wrapper
){

  return function( QUnit ) {

    QUnit.module( 'viz/helper/colorRangeLegend: basic function tests' );

    QUnit.test( `basic legend for 5 items`, async function( assert ){

      // async test
      const done = assert.async();

      try {
        
        // width of the SVG
        const width = 960;

        // create empty document
        const dom = new jsdom.JSDOM( wrapper, { runScripts: "outside-only" } ),
              root = dom.window.document.querySelector( 'svg' );
        root.id = 'legend';

        // create a color scale and fill it
        const color = d3.scaleSequential( d3.interpolateRdYlGn )
                        .domain( [ 0, 100 ] )

        // append legend
        const height = await colorRangeLegend( dom.window.document, d3, '#legend', width, color );
        
        // adjust the viewbox
        root.setAttribute( 'viewBox', `0 0 ${width} ${height}` );

        // append a rect to control the dimensions
        root.insertAdjacentHTML( 'afterbegin', 
                                 `<rect x="0" y="0" width="${width}" height="${height}" style="fill: yellow" />` );

        // extract resulting SVG code
        const svg = root.outerHTML;

        // store the result in a file
        const Fs    = require( 'fs' ),
              Path  = require( 'path' ),
              path  = Path.join( requirejs.toUrl(''), '..', '..', 'tests', 'vizResults', `helper_colorRangeLegend.svg` );
        Fs.writeFileSync( path, `<?xml version="1.0" encoding="UTF-8"?>` + svg );

        // assertions
        assert.ok( true, 'no error while creating the visulization' );

      } catch( e ){

        assert.ok( false, 'Error: ' + e.stack );

      }

      // finished
      done();

    });

  };

});