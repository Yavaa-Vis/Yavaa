/**
 * check the validation of messages
 */
define( [ 'compEngine/validation/validateMessage' ],
function( validateMessage ){

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Sample Message Defs XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  const MessageDef = {
      'singleNumber': {
        params: [
          { 'name': 'prop', 'type': [ 'number' ] }
        ]
      },
      'singleString': {
        params: [
          { 'name': 'prop', 'type': [ 'string' ] }
        ]
      },
      'singleObject': {
        params: [
          { 'name': 'prop', 'type': [ 'object' ] }
        ]
      },
      'singleArray': {
        params: [
          { 'name': 'prop', 'type': [ 'array' ] }
        ]
      },
      'singleTypedArray': {
        params: [
          { 'name': 'prop', 'type': [ 'array' ], arraytype: ['number'] }
        ]
      },
      'singleTypedArray_arr': {
        params: [
          { 'name': 'prop', 'type': [ 'array' ], arraytype: ['array'] }
        ]
      },
      'singleEnum': {
        params: [
          { 'name': 'prop', 'type': [ 'enum' ], 'enumeration': [ 'a1' ] }
        ]
      },
      'singleValMultipleOptions': {
        params: [
          { 'name': 'prop', 'type': [ 'object', 'number' ] }
        ]
      }
  };




  return function( QUnit ) {

    QUnit.module( 'compEngine/validation/validateMessage' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Valid Messages XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    testValid( 'single parameter: number',
        {
          action: 'singleNumber',
          params: { prop: 1 }
        });

    testValid( 'single parameter: string',
        {
          action: 'singleString',
          params: { prop: '1' }
        });

    testValid( 'single parameter: object',
        {
          action: 'singleObject',
          params: { prop: {} }
        });

    testValid( 'single parameter: array',
        {
          action: 'singleArray',
          params: { prop: [] }
        });

    testValid( 'single parameter: typed array',
        {
          action: 'singleTypedArray',
          params: { prop: [1, 2, 3] }
        });

    testValid( 'single parameter: typed array (array of arrays)',
        {
          action: 'singleTypedArray_arr',
          params: { prop: [ [ 1 ], [ 2 ], [ 3 ] ] }
        });

    testValid( 'single parameter: enum',
        {
          action: 'singleEnum',
          params: { prop: 'a1' }
        });

    testValid( 'single parameter, multiple options (Object|Number): object',
        {
          action: 'singleValMultipleOptions',
          params: { prop: {} }
        });

    testValid( 'single parameter, multiple options (Object|Number): number',
        {
          action: 'singleValMultipleOptions',
          params: { prop: 2 }
        });

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Invalid Messages XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    testInvalid( 'missing action',
        {},
        'Command not found: --no action given--' );

    testInvalid( 'missing params property',
        {
          action: 'singleNumber',
        },
        'Parameters missing' );

    testInvalid( 'missing parameter',
        {
          action: 'singleNumber',
          params: {}
        },
        'Missing parameter: prop' );

    testInvalid( 'superfluous parameter',
        {
          action: 'singleNumber',
          params: { prop: 1, someOtherProp: true, }
        },
        'Superfluous parameter: someOtherProp' );

    testInvalid( 'wrong type (string instead of number)',
        {
          action: 'singleNumber',
          params: { prop: 'a' }
        },
        'Invalid type for parameter (prop): Expected number, but found string - "a"' );

    testInvalid( 'wrong type (object instead of array)',
        {
          action: 'singleArray',
          params: { prop: {} }
        },
        'Invalid type for parameter (prop): Expected array, but found object - {}' );

    testInvalid( 'wrong type (array instead of object)',
        {
          action: 'singleObject',
          params: { prop: [] }
        },
        'Invalid type for parameter (prop): Expected object, but found array - []' );

    testInvalid( 'unknown enumeration value',
        {
          action: 'singleEnum',
          params: { prop: 'xyz' }
        },
        'Unknown value for parameter (prop): xyz' );

    testInvalid( 'wrong type in typed array',
        {
          action: 'singleTypedArray',
          params: { prop: [1,2,'a'] }
        },
        'Invalid type for element in parameter (prop): Expected one of ["number"], but found string - [1,2,"a"]' );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helpers XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    /**
     * shortcut function for valid messages
     */
    function testValid( title, msg ) {

      QUnit.test( `Valid Messages - ${title}`, function( assert ){

        // validate the message
        let err = null;
        const validatedMessage = validateMessage( msg, MessageDef, (errMsg) => err = errMsg );

        // assertions
        assert.ok( validatedMessage, 'message is valid' );
        assert.equal( err, null, 'error callback is not called' );

      });

    }

    /**
     * shortcut function for valid messages
     */
    function testInvalid( title, msg, error ) {

      QUnit.test( `Invalid Messages - ${title}`, function( assert ){

        // validate the message
        let err = null;
        const validatedMessage = validateMessage( msg, MessageDef, (errMsg) => err = errMsg );

        // assertions
        assert.notOk( validatedMessage, 'message is invalid' );
        assert.equal( err, error, 'error callback is called' );

      });

    }
  }

});