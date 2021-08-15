/**
 * test workflow/parser/pwf
 *
 * parsing psuedo-workflow into a sequence of commands wrt to dependencies
 */
define( [ 'workflow/parser/pwf',
          'testdata/workflow_parser_pwf'
        ],
function( parse,
          testdata
         ){

  return function( QUnit ) {

    QUnit.module( 'workflow/parser/pwf: complex workflows' );

    testdata
      .forEach( (testcase) => {

        QUnit.test( testcase.label, function( assert ){

          // this is an asynchronous test
          const done = assert.async();

          // parse workflow
          parse( testcase.wf )
            .then( (res) => {

              // validate result: stack
              assert.deepEqual( res.stack, testcase.result, 'validate stack' );

              // validate result: lookup
              res
                .stack
                .forEach( (entry) => {

                  assert.ok( entry.activity in res.lookup, 'lookup contains entry ' + entry.activity );
                  assert.ok( res.lookup[ entry.activity ] === entry, 'lookup and stack point to the same object for entry ' + entry.activity );

                });

            })
            .catch( (e) => assert.ok( false, e.message + ' - ' + e.stack ))
            .then( () => done() );

        });

      });

  }

});