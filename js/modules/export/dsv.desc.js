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
        'desc': 'separator between two values',
        'show': true
      },
      {
        'key':  'newline',
        'type': 'string',
        'desc': 'separator between two rows',
        'show': true
      },
      {
        'key':  'header',
        'type': 'bool',
        'desc': 'Include column headers?',
        'show': true
      }
    ]
  };

});