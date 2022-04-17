/**
 * test workflow/parser/workflow
 *
 * parsing workflow into a sequence of commands wrt to dependencies
 */
define( [ 'workflow/parser/workflow',
          'testdata/workflow_parser_workflow'
        ],
function( parse,
          testdata
         ){

  return function( QUnit ) {

    QUnit.module( 'workflow/parser/workflow: complex workflows' );

    testdata
      .forEach( (testcase) => {

        QUnit.test( testcase.label, async function( assert ){

          // async test
          const done = assert.async();

          // parse workflow
          const res = await parse( testcase.wf )

          // validate result: stack
          assert.deepEqual( res.stack, testcase.result.stack, 'validate stack' );

          // validate result: lookup
          res
            .stack
            .forEach( (entry) => {

              assert.ok( entry.activity in res.lookup, 'lookup contains entry ' + entry.activity );
              assert.ok( res.lookup[ entry.activity ] === entry, 'lookup and stack point to the same object for entry ' + entry.activity );

            });

          // end test
          done();

        });

      });

  }

});