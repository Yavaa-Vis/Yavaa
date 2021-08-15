/**
 * basic testing of viz/helper/colorLegend
 * only server-based
 *
 * stores the results in /tests/vizResults
 *
 */
define( [ 'viz/helper/colorLegend',
          'd3',
          'jsdom',
          'text!template/viz/General.d3.tpl.htm'
], function( colorLegend,
             d3,
             jsdom,
             wrapper
){

  return function( QUnit ) {

    let data;
    QUnit.module( 'viz/helper/colorLegend: basic function tests' );

    data = [ 'A', 'B', 'C', 'D', 'E' ];
    createTest( 'basic legend for 5 items', '5items', 960, data );

    data = ["Albania","Austria","Belgium","Bosnia and Herzegovina","Bulgaria","Croatia","Cyprus","Czechia","Denmark","Estonia","European Union (before the accession of Croatia)","European Union (current composition)","Finland","Former Yugoslav Republic of Macedonia, the","France","Germany","Greece","Hungary","Iceland","Ireland","Italy","Kosovo (under United Nations Security Council Resolution 1244/99)","Latvia","Lithuania","Luxembourg","Malta","Montenegro","Netherlands","Poland","Portugal","Romania","Serbia","Slovakia","Slovenia","Spain","Sweden","Turkey","United Kingdom"];
    createTest( 'basic legend for 38 items (sometimes long country names)', 'longNames', 960, data );


    /**
     * create a single text instance
     */
    function createTest( title, shortTitle, width, data ) {

      QUnit.test( title, async function( assert ){

        // async test
        const done = assert.async();

        try {

          // create empty document
          const dom = new jsdom.JSDOM( wrapper, { runScripts: "outside-only" } ),
                root = dom.window.document.querySelector( 'svg' );
          root.id = 'legend';
  
          // create a color scale and fill it
          const color = d3.scaleOrdinal( d3.schemeCategory10 );
          data.forEach( (l) => color(l) )
  
          // append legend
          const height = await colorLegend( dom.window.document, d3, '#legend', width, color );
          
          // adjust the viewbox
          root.setAttribute( 'viewBox', `0 0 ${width} ${height}` );
  
          // append a rect to control the dimensions
          root.insertAdjacentHTML( 'afterbegin', 
                                   `<rect x="0" y="0" width="${width}" height="${height}" style="fill: yellow" />` );
  
          // add some styling as needed
          root.querySelector( 'style' ).innerHTML = `
          text {
            font: 10px sans-serif;
          }`;
  
          // extract resulting SVG code
          const svg = root.outerHTML;
  
          // store the result in a file
          const Fs    = require( 'fs' ),
                Path  = require( 'path' ),
                path  = Path.join( requirejs.toUrl(''), '..', '..', 'tests', 'vizResults', `helper_colorLegend_${shortTitle}.svg` );
          Fs.writeFileSync( path, `<?xml version="1.0" encoding="UTF-8"?>` + svg );
  
          // assertions
          assert.ok( true, 'no error while creating the visulization' );
  
        } catch( e ){
  
          assert.ok( false, 'Error: ' + e.stack );
  
        }
  
        // finished
        done();
  
      });
    }

  };

});
