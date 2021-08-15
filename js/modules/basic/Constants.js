"use strict";
/*
 * define common constants
 *
 */
define({

  // column types
  ROLE: {
    DIM:  'http://purl.org/linked-data/cube#dimension',
    MEAS: 'http://purl.org/linked-data/cube#measure'
  },

  // column data types
  DATATYPE: {
    NUMERIC: 'numeric',
    BAG:     'bag',
    SEMANTIC:'semantic',
    STRING:  'string',
    TIME:    'time',
  },

  // some major concepts
  CONCEPT: {
    TIME: 'http://eurostat.linked-statistics.org/dic/time',
  },

  // viz data types
  VIZDATATYPE: {
    CATEGORICAL:   1 << 0,
    QUANTITATIVE:  1 << 1,
    TIME:          1 << 2,
    VISUALIZATION: 1 << 3,
  },

  // viz additional bindings
  VIZBINDING: {
    COLOR: 1 << 0,
    ICON:  1 << 1,
  }

});