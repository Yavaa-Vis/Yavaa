/**
 * test comp/stats/getQuantiles
 * 
 * computing quantiles of a given series of values
 */
define( [ 'basic/types/ArbNumber', 
          'comp/stats/getQuantiles'
        ],
function( ArbNumber,
          getQuantiles
         ){

  return function( QUnit ) {

    QUnit.module( 'comp/stats/getQuantiles: simple tests - quartiles' );

    QUnit.test( 'Quartiles', function( assert ){

      // prep array of ten elements
      const input = [];
      for( let i=10; i>0; i-- ) {
        input.push( ArbNumber( ''+i ) );
      }
      
      // calc 4th-quantiles
      const quantiles = getQuantiles( input, 4 );

      // validate result
      assert.equal( quantiles.length, 5, 'should be five values (including max and min)' );
      assert.equal( +quantiles[0], 1,   '1st should be minimum' );
      assert.equal( +quantiles[1], 3,   '2nd should be at 5.5' );
      assert.equal( +quantiles[2], 5.5, '3rd should be at average' );
      assert.equal( +quantiles[3], 8,   '4th should be at 8' );
      assert.equal( +quantiles[4], 10,  '5th should be maximum' );
      
    });

  }

});