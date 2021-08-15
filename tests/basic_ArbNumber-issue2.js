define( [ 'basic/types/ArbNumber'], function( ArbNumber ){

  return function( QUnit ) {

    QUnit.module( 'basic/types/ArbNumber: Issue 2' );


    QUnit.test( 'Issue 2: conversion day to hour', function( assert ){

      // input values
      const v28 = ArbNumber( '28' ),
            v86400 = ArbNumber( '86400' ),
            v36e3  = ArbNumber( '3.6e3' ),
            v2419200 = ArbNumber( '2419200' );  // 28 * 86400

      // compute the conversion from day to hour
      const res = v2419200.div( v36e3 );

      // check the result
      assert.equal( res, '672',  'result should have no decimals' );

    });

  }

});