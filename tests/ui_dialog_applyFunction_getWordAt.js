define( [ 'ui/dialog/applyFunction/getWordAt' ],
function( getWordAt ){

  return function( QUnit ) {

    // testdata
    const testdata = [
      { input: 'valued * 3 + 5',    pos: 5,      output: 'd' },
      { input: '3 ( 4 )',           pos: 2,      output: '(' },
      { input: ',,,',               pos: 0,      output: ',,,' },
    ];

    QUnit.module( 'ui/dialog/applyFunction/getWordAt' );

    QUnit.test( 'Simple testcases', function( assert ){

      for( let i=0; i<testdata.length; i++ ) {

        // get word
        let word = getWordAt( testdata[i].input, testdata[i].pos );

        // assert
        assert.equal( word, testdata[i].output, 'extract word' );

      }

    });

  };

});