define( [ 'grammar/formula'], function( parser ){

  return function( QUnit ) {

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX TESTDATA XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    const testdata = {
        invalid: [
          { input: 'abc' },
          { input: '3 + abc' },
          { input: ',,,' },
          { input: '3.3.3' },
        ],
        valid:[
          // same operator, multiple operands
          { input: '3 + 3',           ast: { value: '+', children: [ { value: '3'}, {value:'3'} ] }, },
          { input: '3 * 3',           ast: { value: '*', children: [ { value: '3'}, {value:'3'} ] }, },
          { input: '1 + 2 + 3',       ast: { value: '+', children: [ { value: '+', children: [ {value:'1'} ,{value:'2'} ] }, {value:'3'} ] }, },
          { input: '1 * 2 * 3',       ast: { value: '*', children: [ { value: '*', children: [ {value:'1'} ,{value:'2'} ] }, {value:'3'} ] }, },
          // precedence
          { input: '1 + 2 * 3',       ast: { value: '+', children: [ {value:'1'}, { value: '*', children: [ {value:'2'} ,{value:'3'} ] } ] }, },
          // paranthesis
          { input: '(3 + 3)',         ast: { value: '+', children: [ { value: '3'}, {value:'3'} ] }, },
          { input: '(3 + 3) * 2',     ast: { value: '*', children: [ { value: '+', children: [ { value: '3' }, { value: '3' } ] }, { value: '2' }, ] }, },
          { input: '2 * (3 + 3)',     ast: { value: '*', children: [ { value: '2' }, { value: '+', children: [ { value: '3' }, { value: '3' } ] }, ] }, },
          { input: '(3 + 3) * 2 + 3', ast: { value: '+', children: [ { value: '*', children: [ { value: '+', children: [ { value: '3' }, { value: '3' } ] }, { value: '2' } ] }, { value: '3' } ] }, },
          { input: '(3 + 3) + 2 * 3', ast: { value: '+', children: [ { value: '+', children: [ { value: '3' }, { value: '3' } ] }, { value: '*', children: [ { value: '2' }, { value: '3' } ] } ] }, },
        ]
    };


    /* XXXXXXXXXXXXXXXXXXXXXXXX VALIDATE FORMULAE XXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.module( 'grammar/formula: valididate formulas' );

    QUnit.test( 'Invalid inputs', function( assert ){

      for( let i=0; i<testdata.invalid.length; i++ ) {

        !(function( input ){
          assert.throws(
              () => parser.parse( input ),
              'invalid input should throw an Exception'
          )
        })( testdata.invalid[i].input );

      }

    });


    QUnit.test( 'Valid inputs', function( assert ){

      for( let i=0; i<testdata.valid.length; i++ ) {

        // shortcut
        const testcase = testdata.valid[i];

        try {

          // compoute
          const res = parser.parse( testcase.input );

          // validate AST
          assert.deepEqual( res, testcase.ast, 'validate AST for: "' + testcase.input + '"' );

        } catch(e) {
          assert.ok( false, 'valid input ("' + testcase.input + '") failed with: ' + e.message );
        }

      }

    });

  };

});