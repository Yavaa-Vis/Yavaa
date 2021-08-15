/**
 * check the structure of all visualization descriptions
 */
define( [ 'viz/RepoList',
          'basic/Constants'
        ],
function( Repo,
          Constants
         ){

  // shortcuts
  const DATATYPE  = Object.values( Constants.VIZDATATYPE ).reduce( (el, all) => el | all, 0 );
        ROLE      = new Set( Object.values( Constants.ROLE ) );

  return function( QUnit ) {

    QUnit.module( 'viz: descriptions general' );

    // get distinct descriptions
    const vizList = [ ... new Set( Repo.map( e => e[0] ) ) ];

    // check all visualization descriptions
    for( let i=0; i<vizList.length; i++ ) {
      !function( entry ) {

        QUnit.test( 'Visualization description: ' + entry, function( assert ){

          // it's async
          const done = assert.async();

          // collect names of visualizations
          const vizNames = new Set();

          // load the respective visualization description
          require( [ 'viz/' + entry + '.desc' ], function( desc ){

            // check all bindings
            assert.ok( desc instanceof Array, 'descriptions is defined as array' );

            // get common attributes
            let name    = desc[0].name,
                preview = desc[0].preview;

            // the name should be unique
            assert.ok( !vizNames.has( name ), 'viz name should be unique' );
            vizNames.add( name );

            for( let j=0; j<desc.length; j++ ) {

              // shortcut
              const binding = desc[j];

              // check properties
              assert.ok( 'name' in binding,           'binding has a name' );
              assert.ok( 'preview' in binding,        'binding has a preview picture' );
              assert.ok( 'columnBinding' in binding,  'binding has a columnBinding' );

              // check types
              assert.equal( typeof binding.name,    'string',    'name is of type string' );
              assert.equal( typeof binding.preview, 'string',    'preview is of type string' );
              assert.ok( binding.columnBinding instanceof Array, 'columnBinding is of type array' );

              // name and preview should be identical for all bindings
              assert.equal( binding.name,    name,    'there should be the same name for all bindings' );
              assert.equal( binding.preview, preview, 'there should be the same preview for all bindings' );

              // check all components
              for( let k=0; k<binding.columnBinding.length; k++ ){

                // shortcut
                const comp = binding.columnBinding[k];

                // presence of properties
                assert.ok( 'role'     in comp, 'component has role' );
                assert.ok( 'datatype' in comp, 'component has datatype' );
                assert.ok( 'desc'     in comp, 'component has desc' );
                assert.ok( 'id'       in comp, 'component has id' );

                // valid values
                assert.ok( ROLE.has( comp.role ),   'role has a valid value' );
                assert.equal( comp.datatype, comp.datatype & DATATYPE, 'datatype has a valid value' ); // data type can be connected via OR
                assert.equal( typeof comp.desc, 'string', 'desc is of type string' );
                assert.equal( typeof comp.id,   'string', 'id is of type string' );

              }

            }

            // all test done
            done();

          });

        });

      }( vizList[i] );
    }

  }

});