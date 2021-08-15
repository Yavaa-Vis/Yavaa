define( [ 'comp/function/parseFormula'], function( fparser ){

	return function( QUnit ) {

	  QUnit.module( 'comp/function/parseFormula: Constant Folding' );

	  /* "3+5" */
	  QUnit.test( '2 constants (add): 3 + 5', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

	    const a = await fparser( null, null, '3 + 5' );

	    assert.equal(     a.funktion,  "return constants['8']", 'funktion' );
	    assert.deepEqual( a.constants, ['8'],      'constants' );
	    assert.deepEqual( a.values,    [],         'values' );
	    assert.deepEqual( a.funktions, [],         'funktions' );

	    // finished
	    done();

	  });


	  /* "3 * 5 + 2" */
	  QUnit.test( '3 constants (mul, add): 3 * 5 + 2', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

	    const a = await fparser( null, null, '3 * 5 + 2' );

	    assert.equal(     a.funktion,  "return constants['17']", 'funktion' );
	    assert.deepEqual( a.constants, ['17'],     'constants' );
	    assert.deepEqual( a.values,    [],         'values' );
	    assert.deepEqual( a.funktions, [],         'funktions' );

      // finished
      done();

	  });


	  /* "1 + 2 * 3" */
	  QUnit.test( '3 constants (add, mul): 1 + 2 * 3', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

	    const a = await fparser( null, null, '1 + 2 * 3' );

	    assert.equal(     a.funktion,  "return constants['7']", 'funktion' );
	    assert.deepEqual( a.constants, ['7'],      'constants' );
	    assert.deepEqual( a.values,    [],         'values' );
	    assert.deepEqual( a.funktions, [],         'funktions' );

      // finished
      done();

	  });


	  /* "3/5" */
	  QUnit.test( 'Div - no folding: 3/5', async function( assert ){

      // async test, so get the callback
      const done = assert.async();

	    const a = await fparser( null, null, '3/5' );

	    assert.equal(     a.funktion,  "return constants['3'].clone().div(constants['5'])", 'funktion' );
	    assert.deepEqual( a.constants, ['3', '5'],   'constants' );
	    assert.deepEqual( a.values,    [],           'values' );
	    assert.deepEqual( a.funktions, [],           'funktions' );

      // finished
      done();

	  });
	}

} );