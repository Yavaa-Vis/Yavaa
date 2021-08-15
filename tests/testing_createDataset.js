"use strict";
/**
 * 
 * validate functionality of testing/createDataset
 * 
 */
define( [ 'basic/Constants', 
          'viz/RepoList',
          'testing/createDataset',
          'store/data',
          'util/requirePromise',
], function( Constants,
             VizRepo,
             createDataset,
             Datastore,
             requireP
){

  return function( QUnit ) {

    /** XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Artificial Test XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.module( 'testing/createDataset: artificial data' );

    QUnit.test( 'simple function tests', async function( assert ){

      // async test
      const done = assert.async();
      
      try {
        
        // create dataset; column description like viz description
        const id = await createDataset({
          columns: [          
            {
              "role" :      Constants.ROLE.DIM,
              "datatype":   Constants.DATATYPE.SEMANTIC,
              "desc":       "y-axis",
              "id":         "col2",
                
              values:   2,
            },
            {
              "role" :      Constants.ROLE.MEAS,
              "datatype":   Constants.DATATYPE.NUMERIC,
              "desc":       "measurement",
              "id":         "col3",
                
              values:   2,
            },
            {
              "role" :      Constants.ROLE.DIM,
              "datatype":   Constants.DATATYPE.TIME,
              "desc":       "x-axis",
              "id":         "col1",
                
              values:   2,
            },
          ],

        });

        // assertions
        assert.equal( typeof id, 'number', 'return value has to be a numeric dataset id' );
        
        if( typeof id == 'number' ) {
          
          // get the respective dataset
          const ds = Datastore.getDataset( id );
          
          // more assertions on the dataset itself
          assert.equal( ds.getRowCount(),     4, 'should result in 4 rows' );
          assert.equal( ds.getData().length,  3, 'should result in 3 columns' );

        }

      } catch( e ){
        
        assert.ok( false, 'Error: ' + e.stack );
        
      }
            
      // finished
      done();

    });
    
    /** XXXXXXXXXXXXXXXXXXXXXXXXXXXX Use Viz Descriptions XXXXXXXXXXXXXXXXXXXXXXXXXXXX */
   
    QUnit.module( 'testing/createDataset: vis descriptions' );

    // this test only applies to actual datasets and not layouts
    VizRepo = VizRepo.filter( viz => !viz[ 4 ] );
    
    for( let entry of VizRepo ) {
      createTest( entry[0], entry[1] );
    }

    /**
     * create a test for the given visualization
     * 
     * @param   {String}    vizName       the name of the visualization
     * @param   {Number}    bindingNr     the index of the binding to use
     */
    function createTest( vizName, bindingNr ) {
     
      QUnit.test( `${vizName} (binding ${bindingNr})`, async function( assert ){

        // async test
        const done = assert.async();
        
        try {
          
          // retrieve viz description
          const desc    = await requireP( `viz/${vizName}.desc` ),
                binding = desc[ bindingNr ].columnBinding;

          // set number of values for test-dataset creation
          for( let entry of binding ) {
            if( entry.datatype == Constants.DATATYPE.CATEGORICAL ) {
              entry.values = 4;
            } else {
              entry.values = 10;
            }
          }
          
          // create a matching dataset
          const data_id = await createDataset( { columns: binding } );
          
          // grab the dataset
          const ds = Datastore.getDataset( data_id );
          
          // array bindings should result in two columns, others just in one
          const exp = binding.reduce( (all,el) => all + (el.isarray ? 2 : 1) , 0 );
          
          // assertions
          assert.equal( ds.getColumnMeta().length, exp, 'should create one column for each binding (array-bindings result in two)' );
          
        } catch( e ){
          
          assert.ok( false, 'Error: ' + e.stack );
          
        }
              
        // finished
        done();

      });
      
    }
    
  };

});