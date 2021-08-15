/**
 * validate functionality of compEngine/parseFormula
 */
define( [ 'comp/function/parseFormula'], function( fparser ){

  return function( QUnit ) {

    /** XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX value parameter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.module( 'comp/function/parseFormula: only current column parameter' );

    /* "3 + 5 * ( value + 3 / 8) " */
    QUnit.test( 'Simple formula', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      // test inputs
      const a = await fparser( null, null, '3 + 5 * ( value + 3 / 8) ' );

      // sort all returned arrays
      a.constants = a.constants.sort();
      a.values    = a.values.sort();
      a.funktions = a.funktions.sort();

      // the desired result, sorted as well, so it has the same ordering as the output no matter which sort is used
      const result = {
          funktion: 'if( values[\'value\'].isNull ) { return values[\'value\']; }return constants[\'3\'].clone().add(constants[\'5\'].clone().mul(values[\'value\'].clone().add(constants[\'3\'].clone().div(constants[\'8\']))))',
          constants: ['3', '5', '8' ].sort(),
          values: ['value'].sort(),
          funktions: []
      };

      assert.equal(     a.funktion,  result.funktion,   'funktion' );
      assert.deepEqual( a.constants, result.constants,  'constants' );
      assert.deepEqual( a.values,    result.values,     'values' );
      assert.deepEqual( a.funktions, result.funktions,  'funktions' );

      done();

    });

    /** XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX value parameter XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.module( 'comp/function/parseFormula: multiple column parameter' );

    /* "3 + 5 * ( value + 3 / 8) " */
    QUnit.test( 'Simple formula', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

      // test inputs
      const a = await fparser( null, null, 'col0 + col1' );

      // sort all returned arrays
      a.constants = a.constants.sort();
      a.values    = a.values.sort();
      a.funktions = a.funktions.sort();

      // the desired result, sorted as well, so it has the same ordering as the output no matter which sort is used
      const result = {
          funktion:  'if( values[\'col0\'].isNull ) { return values[\'col0\']; }if( values[\'col1\'].isNull ) { return values[\'col1\']; }return values[\'col0\'].clone().add(values[\'col1\'])',
          constants: [].sort(),
          values: [ 'col0', 'col1' ].sort(),
          funktions: []
      };

      assert.equal(     a.funktion,  result.funktion,   'funktion' );
      assert.deepEqual( a.constants, result.constants,  'constants' );
      assert.deepEqual( a.values,    result.values,     'values' );
      assert.deepEqual( a.funktions, result.funktions,  'funktions' );

      done();

    });

  };

});