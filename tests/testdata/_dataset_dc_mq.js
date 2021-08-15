/**
 * serialized dataset for use within tests
 *
 * - see basic/types/Dataset and shared/types/Column for format details
 */
define([ 'basic/Constants',
         'basic/types/ArbNumber',
         'basic/types/String'],
function( Constants,
          ArbNumber,
          String
){
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
          datatype: Constants.DATATYPE.STRING,
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
      [ String('a'),    String('b'),    String('c')  ],
      [ ArbNumber(1),   ArbNumber(2),   ArbNumber(3) ]
    ]
  };
})