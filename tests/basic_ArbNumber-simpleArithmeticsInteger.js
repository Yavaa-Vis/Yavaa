define( [ 'basic/types/ArbNumber'], function( ArbNumber ){

  return function( QUnit ){

    QUnit.module( 'basic/types/ArbNumber: Simple Arithemtics (integer)' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ADD XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'Add (a>0; b>0)', function( assert ){

      var a = ArbNumber( '3' ),
          b = ArbNumber( '5' ),
          c = ArbNumber( '9007199254740992' );  // max_int

      a.add( b );
      b.add( c );
      c.add( c );

      assert.equal( a.toString(), '8', '3+5' );
      assert.equal( b.toString(), '9007199254740997', 'MAX_INT + 5' );
      assert.equal( c.toString(), '18014398509481984', 'MAX_INT + MAX_INT' );

    });

    QUnit.test( 'Add (a<0; b<0)', function( assert ){

      var a = ArbNumber( '-3' ),
          b = ArbNumber( '-5' );

      a.add( b );

      assert.equal( a.toString(), -8, '(-3)+(-5)' );

    });

    QUnit.test( 'Add (a<0; b>0)', function( assert ){

      var a = ArbNumber( '-3' ),
          b = ArbNumber( '5' ),
          c = ArbNumber( '-10' );

      a.add( b );
      c.add( b );

      assert.equal( a.toString(), 2, '(-3)+5' );
      assert.equal( c.toString(), -5, '(-10)+5' );

    });

    QUnit.test( 'Add (a>0; b<0)', function( assert ){

      var a = ArbNumber( '3' ),
          b = ArbNumber( '-5' ),
          c = ArbNumber( '10' );

      a.add( b );
      c.add( b );

      assert.equal( a.toString(), -2, '3+(-5)' );
      assert.equal( c.toString(), 5, '10+(-5)' );

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX SUB XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'Sub (a>0; b>0)', function( assert ){

      var a = ArbNumber( '3' ),
          b = ArbNumber( '5' ),
          c = ArbNumber( '10' ),
          d = ArbNumber( '100' ),
          e = ArbNumber( '75' );

      a.sub( b );
      c.sub( b );
      d.sub( e );

      assert.equal( c.toString(), '5', '10-5' );
      assert.equal( a.toString(), '-2', '3-5' );
      assert.equal( d.toString(), '25', '100-75' );

    });

    QUnit.test( 'Sub (a<0; b<0)', function( assert ){

      var a = ArbNumber( '-3' ),
            b = ArbNumber( '-5' ),
            c = ArbNumber( '-10' );

      a.sub( b );
      c.sub( b );

      assert.equal( a.toString(), 2, '(-3)-(-5)' );
      assert.equal( c.toString(), -5, '(-10)-(-5)' );

    });

    QUnit.test( 'Sub (a<0; b>0)', function( assert ){

      var a = ArbNumber( '-3' ),
          b = ArbNumber( '5' );

      a.sub( b );

      assert.equal( a.toString(), -8, '(-3)-5' );

    });

    QUnit.test( 'Sub (a>0; b<0)', function( assert ){

      var a = ArbNumber( '3' ),
          b = ArbNumber( '-5' );

      a.sub( b );

      assert.equal( a.toString(), 8, '3-(-5)' );

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX MUL XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    QUnit.test( 'Mul (a>0; b>0)', function( assert ){

      var a = ArbNumber( '2' ),
          b = ArbNumber( '3' ),
          c = ArbNumber( '80' );

      b.mul( a );
      c.mul( a );

      assert.equal( b.toString(), '6', '2 * 3' );
      assert.equal( c.toString(), '160', '2 * 80' );

    });

  }

});