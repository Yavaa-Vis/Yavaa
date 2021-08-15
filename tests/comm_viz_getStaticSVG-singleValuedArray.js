/**
 * basic testing of visualizations
 * done through comm/viz.getStaticSVG()
 *
 * stores the results in /tests/vizResults
 *
 */
define( [ 'module',
          'basic/Constants',
          'viz/RepoList',
          'testing/createDataset',
          'store/data',
          'util/requirePromise',
          'comm/viz',
], function( module,
             Constants,
             VizRepo,
             createDataset,
             Datastore,
             requireP,
             commViz
){

  return function( QUnit ) {

    QUnit.module( 'viz/*: bind array columns to single values' );
    
    // for these tests we only use non-nesting visualizations
    // that have at least one array column
    VizRepo = VizRepo.filter( entry => !entry[4] && entry[6] );

    for( let entry of VizRepo ) {
      createTest( entry[0], entry[1] );
    }

    /** XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX TEST Generator XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    /**
     * create a test for the given visualization
     *
     * @param   {String}    vizName       the name of the visualization
     * @param   {Number}    bindingNr     the index of the binding to use
     */
    function createTest( vizName, bindingNr ) {

      QUnit.test( `${vizName} (binding ${bindingNr}) getStaticSVG() - single valued arrays`, async function( assert ){

        // async test
        const done = assert.async();

        try {

          // retrieve viz description
          const desc    = await requireP( `viz/${vizName}.desc` ),
                binding = JSON.parse( JSON.stringify( desc[ bindingNr ].columnBinding ) );

          // set number of values for test-dataset creation
          for( let entry of binding ) {
            if( entry.datatype == Constants.DATATYPE.CATEGORICAL ) {
              entry.values = 4;
            } else {
              entry.values = 10;
            }
          }
          
          // sometimes the testing section overrides some values
          if( 'columns' in desc[ bindingNr ].testing ) {
            for( let i=0; i<binding.length; i++ ) {
              if( desc[ bindingNr ].testing.columns[ i ] ) {
                binding[ i ] = { ... binding[ i ], ... desc[ bindingNr ].testing.columns[ i ] };
              }
            }
          }
          
          // set multitude of array columns to 1
          for( let col of binding ) {
            if( col.isarray ) {
              col.multitude = 1;
            }
          }

          // create a matching dataset
          const data_id = await createDataset( { columns: binding, settings: desc[ bindingNr ].testing } );

          // create parameter object
          const params = {
              data_id:  data_id,
              type:     vizName,
              options:  {}
          };
          let pos = 0;
          for( let i=0; i<binding.length; i++ ) {
            
            const e = binding[i];

            // as array columns are also bound to just one value, we omit the array here for testing purposes
            params.options[ e.id ] = pos;
            pos += 1;
            
          }

          // create visualization
          const response = await commViz.getStaticSVG( params );

          // store the result in a file
          const Fs    = require( 'fs' ),
                Path  = require( 'path' ),
                path  = Path.join( requirejs.toUrl(''), '..', '..', 'tests', 'vizResults', `${vizName}${bindingNr}_singleValuedArray.svg` );
          Fs.writeFileSync( path, `<?xml version="1.0" encoding="UTF-8"?>` + response.params.code );

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