/**
 * serialized dataset for use within tests
 *
 * - does not include any data! so only tests related to the meta data possible
 * - see basic/types/Dataset and shared/types/Column for format details
 */
define([ 'basic/Constants', 'basic/types/ArbNumber', ], function( Constants, ArbNumber ){
  return {
    ds: {
      metadata: {
        title:      'testdummy',
        publisher:  'someone'
      },
      distr: [],
      distrUsed: 0,
      columns:[
        {
          label:    'col1',
          concept:  'col1Concept',
          coded:    false,
          role:     Constants.ROLE.DIM,
          order:    0,
          datatype: Constants.DATATYPE.NUMERIC,
        },
        {
          label:    'col2',
          concept:  'col2Concept',
          coded:    false,
          role:     Constants.ROLE.MEAS,
          order:    1,
          datatype: Constants.DATATYPE.NUMERIC,

        }
      ]
    },
    data: [ 
      [ ArbNumber(1),   ArbNumber(2),   ArbNumber(3) ],
      [ ArbNumber(1),   ArbNumber(2),   ArbNumber(3) ]
    ]
  };
})