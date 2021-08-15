/**
 * test inputs for search by combination tests
 * -> integration tests
 * -> A, B are dimensions; C is measurement
 *
 * column format:
 * {
 *    "concept":    String,
 *    "minValue":   Number || null,
 *    "maxValue":   Number || null,
 *    "colEnums":   Array[String] || null,
 * }
 *
 * ds format:
 * {
 *  ds:     URI,
 *  title:  String,
 *  src:    URI,
 *  srcLabel: String
 *  covers: [ ... columns ]
 * }
 */
define([], [

  /* ------------------------------------------------------------------------------------------------------------- */
  {

  label: '3 columns, complete cover',

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Query XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  query: [{
    datatype:  'semantic',
    concept:   'A',
    minValue:  null,
    maxValue:  null,
    colEnums: [ 'A1', 'A2', 'A3' ]
  },{
    datatype:  'numeric',
    concept:   'B',
    minValue:  2000,
    maxValue:  2010,
    colEnums:  null
  },{
    datatype:  'numeric',
    concept:   'C',
    minValue:  20,
    maxValue:  null,
    colEnums:  null
  }],

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Candidates XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  candidates: [{
    ds:       'ds1',
    title:    'Dataset 1',
    src:      'src1',
    srcLabel: 'Source 1',
    totalDimCount: 2,
    covers: [{
      datatype: 'semantic',
      concept:  'A',
      minValue: null,
      maxValue: null,
      colEnums: [ 'A1', 'A2' ],
      isMeas:   false,
      totalEnumCount: 2
    },{
      datatype:  'numeric',
      concept:   'B',
      minValue:  2000,
      maxValue:  2010,
      colEnums:  null,
      isMeas:    false
    },{
      datatype:  'numeric',
      concept:   'C',
      minValue:  20,
      maxValue:  100,
      colEnums:  null,
      isMeas:    true

    }]
  },{
    ds:       'ds2',
    title:    'Dataset 2',
    src:      'src1',
    srcLabel: 'Source 1',
    totalDimCount: 2,
    covers: [{
      datatype:  'semantic',
      concept:   'A',
      minValue:  null,
      maxValue:  null,
      colEnums: [ 'A3' ],
      isMeas:   false,
      totalEnumCount: 1
    },{
      datatype:  'numeric',
      concept:   'B',
      minValue:  2000,
      maxValue:  2010,
      colEnums:  null,
      isMeas:    false
    },{
      datatype:  'numeric',
      concept:   'C',
      minValue:  0,
      maxValue:  50,
      colEnums:  null,
      isMeas:    true

    }]
  },{
    ds:       'ds3',
    title:    'Dataset 3',
    src:      'src1',
    srcLabel: 'Source 1',
    totalDimCount: 2,
    covers: [{
      datatype:  'semantic',
      concept:   'A',
      minValue:  null,
      maxValue:  null,
      colEnums: [ 'A2' ],
      isMeas:   false,
      totalEnumCount: 1
    },{
      datatype:  'numeric',
      concept:   'B',
      minValue:  2000,
      maxValue:  2010,
      colEnums:  null,
      isMeas:    false
    },{
      datatype:  'numeric',
      concept:   'C',
      minValue:  30,
      maxValue:  80,
      colEnums:  null,
      isMeas:    true
    }]
  }],

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Result XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  result: [ "ds1", "ds2" ]

},

  /* ------------------------------------------------------------------------------------------------------------- */
  {

  label: '3 columns, not matching due to numeric column',

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Query XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  query: [{
    datatype:  'semantic',
    concept:   'A',
    minValue:  null,
    maxValue:  null,
    colEnums: [ 'A1', 'A2', 'A3' ]
  },{
    datatype:  'numeric',
    concept:   'B',
    minValue:  2000,
    maxValue:  2010,
    colEnums:  null
  },{
    datatype:  'numeric',
    concept:   'C',
    minValue:  20,
    maxValue:  null,
    colEnums:  null
  }],

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Candidates XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  candidates: [{
    ds:       'ds1',
    title:    'Dataset 1',
    src:      'src1',
    srcLabel: 'Source 1',
    covers: [{
      datatype:  'semantic',
      concept:  'A',
      minValue: null,
      maxValue: null,
      colEnums: [ 'A1', 'A2' ],
      isMeas:   false,
      totalEnumCount: 2
    },{
      datatype:  'numeric',
      concept:   'B',
      minValue:  2100,
      maxValue:  2110,
      colEnums:  null,
      isMeas:    false
    },{
      datatype:  'numeric',
      concept:   'C',
      minValue:  20,
      maxValue:  100,
      colEnums:  null,
      isMeas:    true

    }]
  }],

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Result XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  result: []
},

  /* ------------------------------------------------------------------------------------------------------------- */
  {

  label: '5 columns, two joins; adapted from real data',

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Query XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  query: [{
    "datatype" : "semantic",
    "concept" : "http://eurostat.linked-statistics.org/dic/geo",
    "colEnums" : ["http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK"],
    "minValue" : null,
    "maxValue" : null
  }, {
    "datatype" : "time",
    "concept" : "http://eurostat.linked-statistics.org/dic/time",
    "colEnums" : null
  }, {
    "datatype" : "numeric",
    "concept" : "http://yavaa.org/ns/eurostat/meas/tps00058",
    "colEnums" : null
  }, {
    "datatype" : "numeric",
    "concept" : "http://yavaa.org/ns/eurostat/meas/tps00059",
    "colEnums" : null
  }, {
    "datatype" : "numeric",
    "concept" : "http://yavaa.org/ns/eurostat/meas/tps00057",
    "colEnums" : null
  }],

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX Candidates XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  candidates:
    [
      {
        "ds": "http://yavaa.org/ns/eurostat/dsd#tps00059",
        "covers": [
          {
            "datatype": 'semantic',
            "concept": "http://eurostat.linked-statistics.org/dic/geo",
            "minValue": null,
            "maxValue": null,
            "isMeas": false,
            "colEnums": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "codelist": "http://yavaa.org/ns/cl/eurostat#geo_235",
            "order": 2,
            "totalEnumCount": 34
          },
          {
            "datatype": 'time',
            "concept": "http://eurostat.linked-statistics.org/dic/time",
            "minValue": new Date( "2004-01-01T00:00:01.000Z" ),
            "maxValue": new Date( "2012-01-01T00:00:01.000Z" ),
            "isMeas": false,
            "colEnums": null,
            "codelist": null,
            "order": 3
          },
          {
            "datatype": 'numeric',
            "concept": "http://yavaa.org/ns/eurostat/meas/tps00059",
            "minValue": null,
            "maxValue": 100,
            "isMeas": true,
            "colEnums": null,
            "codelist": null,
            "order": 4
          }
        ],
        "measureCount": 1
      },
      {
        "ds": "http://yavaa.org/ns/eurostat/dsd#tps00058",
        "covers": [
          {
            "datatype": 'semantic',
            "concept": "http://eurostat.linked-statistics.org/dic/geo",
            "minValue": null,
            "maxValue": null,
            "isMeas": false,
            "colEnums": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "codelist": "http://yavaa.org/ns/cl/eurostat#geo_235",
            "order": 2,
            "totalEnumCount": 34
          },
          {
            "datatype": 'time',
            "concept": "http://eurostat.linked-statistics.org/dic/time",
            "minValue": new Date( "2003-01-01T00:00:01.000Z" ),
            "maxValue": new Date( "2012-01-01T00:00:01.000Z" ),
            "isMeas": false,
            "colEnums": null,
            "codelist": null,
            "order": 3
          },
          {
            "datatype": 'numeric',
            "concept": "http://yavaa.org/ns/eurostat/meas/tps00058",
            "minValue": 0.3,
            "maxValue": 100,
            "isMeas": true,
            "colEnums": null,
            "codelist": null,
            "order": 4
          }
        ],
        "measureCount": 1
      },
      {
        "ds": "http://yavaa.org/ns/eurostat/dsd#tps00057",
        "covers": [
          {
            "datatype": 'semantic',
            "concept": "http://eurostat.linked-statistics.org/dic/geo",
            "minValue": null,
            "maxValue": null,
            "isMeas": false,
            "colEnums": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "codelist": "http://yavaa.org/ns/cl/eurostat#geo_235",
            "order": 2,
            "totalEnumCount": 34
          },
          {
            "datatype": 'time',
            "concept": "http://eurostat.linked-statistics.org/dic/time",
            "minValue": new Date( "2003-01-01T00:00:01.000Z" ),
            "maxValue": new Date( "2012-01-01T00:00:01.000Z" ),
            "isMeas": false,
            "colEnums": null,
            "codelist": null,
            "order": 3
          },
          {
            "datatype": 'numeric',
            "concept": "http://yavaa.org/ns/eurostat/meas/tps00057",
            "minValue": 36.2,
            "maxValue": 100,
            "isMeas": true,
            "colEnums": null,
            "codelist": null,
            "order": 4
          }
        ],
        "measureCount": 1
      }
    ],

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Result XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  result: [ 'http://yavaa.org/ns/eurostat/dsd#tps00059',
            'http://yavaa.org/ns/eurostat/dsd#tps00058',
            'http://yavaa.org/ns/eurostat/dsd#tps00057'
          ],

}]);