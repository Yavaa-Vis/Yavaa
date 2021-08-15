define( [ 'basic/types/ArbNumber'], function( ArbNumber ){

  return function( QUnit ) {

    QUnit.module( 'basic/types/ArbNumber: General functionality' );


    QUnit.test( 'construct & toString', function( assert ){
      // small numbers
      var a = ArbNumber( '3' ),
          b = ArbNumber( '-5' ),
          c = ArbNumber( '1.5' ),
          d = ArbNumber( '-2.5' ),
          g = ArbNumber( '1000' ),
          h = ArbNumber( '0.25' ),
          a1 = ArbNumber( '0' );

      // large numbers
      var e = ArbNumber( '9007199254740992' ),  // max_int
          f = ArbNumber( '18014398509481984' ), // 2 * max_int
          i = ArbNumber( '10000000000000000' ), // 10 ^ 16
          j = ArbNumber( '0.000000000000001' ); // 10 ^ -16

      // scientific notation
      var k = ArbNumber( '0.123e-10' ),
          l = ArbNumber( '123e5' ),
          m = ArbNumber( '0.0000000000123e10' ),
          n = ArbNumber( '3e-10' ),
          o = ArbNumber( '0.123e3' ),
          p = ArbNumber( '1e-2' ),
          q = ArbNumber( '3.048e-1' );

      assert.equal( a1.toString(), '0', 'zero' );
      assert.equal( a.toString(), '3', 'positive integer' );
      assert.equal( b.toString(), '-5', 'negative integer' );
      assert.equal( c.toString(), '1.5', 'positive float' );
      assert.equal( d.toString(), '-2.5', 'negative float' );

      assert.equal( g.toString(), '1000', 'trailing zeros' );
      assert.equal( h.toString(), '0.25', 'preceeding zeros' );

      assert.equal( e.toString(), '9007199254740992', 'large int (MAX_INT)' );
      assert.equal( f.toString(), '18014398509481984', 'even larger int (2*MAX_INT)' );
      assert.equal( i.toString(), '10000000000000000', 'large number with trailing zeros (10^16)' );
      assert.equal( j.toString(), '0.000000000000001', 'small number with preceeding zeros (10^-16)' );

      assert.equal( k.toString(), '0.0000000000123', 'scientific notation I - 0.123e-10' );
      assert.equal( l.toString(), '12300000', 'scientific notation II - 123e5' );
      assert.equal( m.toString(), '0.123', 'scientific notation III - 0.0000000000123e10' );
      assert.equal( n.toString(), '0.0000000003', 'scientific notation IV - 3e-10' );
      assert.equal( o.toString(), '123', 'scientific notation V - 0.123e3' );
      assert.equal( p.toString(), '0.01', 'scientific notation VI - 1e-2' );
      assert.equal( q.toString(), '0.3048', 'scientific notation VII - 3.048e-1' );

    });


    QUnit.test( 'cope with invalid inputs', function( assert ){
      
      [ 
        [ '66238007 p', '66238007' ],
        [ '123 456', '123' ],
        [ 'abc123', '123' ],
      ]
        .forEach( (pair) => {
          
          // shortcuts
          const [input, output] = pair;
          
          // convert to number
          const num = ArbNumber( input );
          
          // compare
          assert.equal( num.toString(), output, 'cope with invalid characters' );
          
        });

    });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX COMP XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'comp', function( assert ){

      // small numbers
      var a = ArbNumber( '3' ),
          b = ArbNumber( '5' ),
          c = ArbNumber( '-3' ),
          d = ArbNumber( '-5' ),
          e = ArbNumber( '0' ),
          f = ArbNumber( '0' );
      // large numbers
      var g = ArbNumber( '9007199254740992' ),  // max_int
          h = ArbNumber( '18014398509481984' ); // 2 * max_int

      assert.equal( a.compare( a ), 0, '3 ? 3' );
      assert.equal( a.compare( b ), -1, '3 ? 5' );
      assert.equal( a.compare( c ), 1, '3 ? -3' );
      assert.equal( a.compare( d ), 1, '3 ? -5' );

      assert.equal( c.compare( a ), -1, '-3 ? 3' );
      assert.equal( c.compare( b ), -1, '-3 ? 5' );
      assert.equal( c.compare( c ), 0, '-3 ? -3' );
      assert.equal( c.compare( d ), 1, '-3 ? -5' );

      assert.equal( f.compare( e ), 0, '0 ? 0' );

      assert.equal( g.compare( h ), -1, 'MAX_INT ? 2*MAX_INT' );

      assert.equal( g.compare( a ), 1, 'MAX_INT ? 3' );

    });


    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX INVERSE XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    QUnit.test( 'inverse', function( assert ){

      var a = ArbNumber( '5' ),
          b = ArbNumber( '0.2' ),
          c = ArbNumber( '0' ),
          d = ArbNumber( '2' ),
          e = ArbNumber( '-2' );

      a.inverse();
      b.inverse();
      d.inverse();
      e.inverse();

      assert.equal( a.toString(), '0.2', '1 / 5' );
      assert.equal( b.toString(), '5', '1 / 0.2' );
      assert.raises( function(){ c.inverse(); }, null, '1 / 0 (leading to exception)' );
      assert.equal( d.toString(), '0.5', '1 / 2' );
      assert.equal( e.toString(), '-0.5', '1 / -2' );

    });

  }

});