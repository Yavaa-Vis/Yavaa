define( [ 'basic/types/ArbNumber'], function( ArbNumber ){

  return function( QUnit ) {

    QUnit.module( 'basic/types/ArbNumber: Simple Arithemtics (float)' );

    QUnit.test( 'Add (a>0, b>0)', function( assert ){

      var a = ArbNumber( '1' ),
          b = ArbNumber( '0.99999900000025' );

      a.add( b );

      assert.equal( a.toString(), '1.99999900000025', '1 + 0.99999900000025' );

    });

    QUnit.test( 'SUB (a>0; b>0)', function( assert ){

      var a = ArbNumber( '0.75' ),
          b = ArbNumber( '1' );

      a.sub( b );

      assert.equal( a.toString(), '-0.25', '0.75 - 1' );

    } );

    QUnit.test( 'Mul (a>0; b>0)', function( assert ){

      var a = ArbNumber( '0.1' ),
          c = ArbNumber( '0.01' ),
          b = ArbNumber( '0.07' ),
          d = ArbNumber( '0.0625' );

      a.mul( a );
      b.mul( b );
      c.mul( c );
      d.mul( d );

      assert.equal( a.toString(), '0.01', '0.1 * 0.1' );
      assert.equal( b.toString(), '0.0049', '0.07 * 0.07' );
      assert.equal( c.toString(), '0.0001', '0.01 * 0.01' );
      assert.equal( d.toString(), '0.00390625', '0.0625 * 0.0625' );

    } );


    QUnit.test( 'Div (a>0; b>0)', function( assert ){

      var a = ArbNumber( '20' ),
          b = ArbNumber( '5' ),
          c = ArbNumber( '12' ),
          d = ArbNumber( '3' );

      assert.equal( a.clone().div( b ).toString(), '4', '20 / 5' );
      assert.equal( a.clone().div( d, 3 ).toString(), '6.666666666666666666667', '20 / 3 (precision: 3)' );


    } );

    QUnit.test( 'Div (a>0; b<0)', function( assert ){

      var a = ArbNumber( '20' ),
          b = ArbNumber( '-5' ),
          c = ArbNumber( '11' );

      assert.equal( a.div( b ).toString(), '-4', '20 / (-5)' );
      assert.equal( c.div( b, 3 ).toString(), '-2.2', '11 / (-5) (precision: 3)' );

    } );


    QUnit.test( 'Div (a<0; b>0)', function( assert ){

      var a = ArbNumber( '-20' ),
          b = ArbNumber( '5' ),
          c = ArbNumber( '-11' );

      assert.equal( a.div( b ).toString(), '-4', '-20 / 5' );
      assert.equal( c.div( b, 3 ).toString(), '-2.2', '-11 / 5 (precision: 3)' );

    } );

    QUnit.test( 'Div (a<0; b<0)', function( assert ){

      var a = ArbNumber( '-20' ),
          b = ArbNumber( '-5' ),
        c = ArbNumber( '-12' ),
          d = ArbNumber( '-3' );

      assert.equal( a.clone().div( b ).toString(), '4', '-20 / -5' );
      assert.equal( a.clone().div( d, 3 ).toString(), '6.666666666666666666667', '-20 / -3 (precision: 3)' );

    } );


    QUnit.test( 'Mul a * b == 1', function( assert ){

      var a = ArbNumber( '0.01' ),
          b = ArbNumber( '100' );

      assert.equal( a.clone().mul( b ).toString(), '1', '0.01 * 100' );

    } );
  }

});