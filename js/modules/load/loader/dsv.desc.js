"use strict";
/**
 * description for DSV parser
 */
define( [], function(){

  return {
    'name': 'DSV-file',
    'desc': 'Delimiter separated file',
    'ext':  [ 'tsv', 'csv' ],
    'settings': [
      {
        'key':  'delimiter',
        'type': 'string',
        'desc': 'Separator between two values',
        'show': true
      },
      {
        'key':  'newline',
        'type': 'string',
        'desc': 'Separator between two rows',
        'show': false
      },
      {
        'key':  'header',
        'type': 'bool',
        'desc': 'Treat the first row as a header row?',
        'show': true
      },
      {
        'key':  'rows',
        'type': 'number',
        'desc': 'How many rows should be parsed',
        'show': false
      },
    ]
  };

});