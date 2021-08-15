/**
 * basic testing of visualizations (nested)
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

    QUnit.module( 'viz/*: basic function tests (nesting)' );
    
    // for these tests we only use nesting visualizations
    VizRepo = VizRepo.filter( entry => entry[4] );

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

      QUnit.test( `${vizName} (binding ${bindingNr}) getStaticSVG()`, async function( assert ){

        // async test
        const done = assert.async();

        try {

          // retrieve viz description
          const outerDesc    = await requireP( `viz/${vizName}.desc` ),
                outerBinding = JSON.parse( JSON.stringify( outerDesc[ bindingNr ].columnBinding ) );

          // load nested viz description
          const nestedViz     = outerDesc[ bindingNr ].testing.nested,
                nestedDesc    = await requireP( `viz/${nestedViz}.desc` ),
                nestedBinding = JSON.parse( JSON.stringify( nestedDesc[ 0 ].columnBinding ) );

          // create combined list of column bindings
          const binding = [],
                vizBinding = [];
          for( let col of outerBinding ) {
            if( col.datatype != Constants.VIZDATATYPE.VISUALIZATION ) {
              binding.push( col );
            } else {
              vizBinding.push( col );
            }
          }
          binding.push( ... nestedBinding );

          // set number of values for test-dataset creation
          for( let entry of binding ) {
            if( entry.datatype == Constants.DATATYPE.CATEGORICAL ) {
              entry.values = 4;
            } else {
              entry.values = 10;
            }
          }

          // sometimes the testing section overrides some values
          if( 'columns' in outerDesc[ bindingNr ].testing ) {
            for( let i=0; i<binding.length; i++ ) {
              if( outerDesc[ bindingNr ].testing.columns[ i ] ) {
                binding[ i ] = Object.assign( binding[ i ], outerDesc[ bindingNr ].testing.columns[ i ] );
              }
            }
          }

          // create a matching dataset
          const data_id = await createDataset( { columns: binding, settings: outerDesc[ bindingNr ].testing } );

          // create parameter object
          const params = {
              data_id:  data_id,
              type:     vizName,
              options:  {
                
              }
          };
          let pos = 0;
          for( let i=0; i<binding.length; i++ ) {
            
            const e = binding[i];
            
            if( e.isarray ) {
              
              params.options[ e.id ] = [ pos, pos+1 ];
              pos += 2;
              
            } else {
              
              params.options[ e.id ] = pos;
              pos += 1;
              
            }
            
          }
          vizBinding.forEach( (b) => params.options[ b.id ] = nestedViz );

          // create visualization
          const response = await commViz.getStaticSVG( params );

          // store the result in a file
          const Fs    = require( 'fs' ),
                Path  = require( 'path' ),
                path  = Path.join( requirejs.toUrl(''), '..', '..', 'tests', 'vizResults', `${vizName}${bindingNr}.svg` );
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