"use strict";
define( [], [
  
  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
  {
      
    label: 'four columns; all joins; adapted from real data',
    
    components: [
      {
        "ds": "http://yavaa.org/ns/eurostat/dsd#tps00059",
        "dsPublisher": "http://yavaa.org/ns/Eurostat",
        "filter": {
          "2": {
            "values": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "order": 2,
            "effective": true
          }
        },
        "columns": [
          null,
          {
            "concept": "http://eurostat.linked-statistics.org/dic/indic_ed",
            "label": "Education indicator",
            "coded": "http://purl.org/linked-data/cube#CodedProperty",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 1,
            "codelist": "http://yavaa.org/ns/cl/eurostat#indic_ed_12",
            "datatype": "semantic"
          },
          {
            "concept": "http://eurostat.linked-statistics.org/dic/geo",
            "label": "Geopolitical entity (reporting)",
            "coded": "http://purl.org/linked-data/cube#CodedProperty",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 2,
            "codelist": "http://yavaa.org/ns/cl/eurostat#geo_235",
            "datatype": "semantic",
            "usedRange": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "coverage": 1
          },
          {
            "time": "http://yavaa.org/ns/yavaa#instant-YYYY",
            "concept": "http://eurostat.linked-statistics.org/dic/time",
            "label": "Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)",
            "numeric": "numeric",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 3,
            "datatype": "time",
            "usedRange": {
              "minValue": new Date( "2004-01-01T00:00:01.000Z" ),
              "maxValue": new Date( "2012-01-01T00:00:01.000Z" )
            },
            "coverage": null
          },
          {
            "concept": "http://yavaa.org/ns/eurostat/meas/tps00059",
            "label": "Pupils learning German",
            "numeric": "numeric",
            "role": "http://purl.org/linked-data/cube#measure",
            "order": 4,
            "datatype": "numeric",
            "usedRange": {
              "minValue": null,
              "maxValue": 100
            },
            "coverage": 1
          }
        ],
        "aggColumns": [
          1
        ],
        "resultOrder": {
          "2": 0,
          "3": 1,
          "4": 3
        },
        "coverage": 0.6
      },
      {
        "ds": "http://yavaa.org/ns/eurostat/dsd#tps00058",
        "dsPublisher": "http://yavaa.org/ns/Eurostat",
        "filter": {
          "2": {
            "values": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "order": 2,
            "effective": true
          }
        },
        "columns": [
          null,
          {
            "concept": "http://eurostat.linked-statistics.org/dic/indic_ed",
            "label": "Education indicator",
            "coded": "http://purl.org/linked-data/cube#CodedProperty",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 1,
            "codelist": "http://yavaa.org/ns/cl/eurostat#indic_ed_13",
            "datatype": "semantic"
          },
          {
            "concept": "http://eurostat.linked-statistics.org/dic/geo",
            "label": "Geopolitical entity (reporting)",
            "coded": "http://purl.org/linked-data/cube#CodedProperty",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 2,
            "codelist": "http://yavaa.org/ns/cl/eurostat#geo_235",
            "datatype": "semantic",
            "usedRange": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "coverage": 1
          },
          {
            "time": "http://yavaa.org/ns/yavaa#instant-YYYY",
            "concept": "http://eurostat.linked-statistics.org/dic/time",
            "label": "Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)",
            "numeric": "numeric",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 3,
            "datatype": "time",
            "usedRange": {
              "minValue": new Date( "2003-01-01T00:00:01.000Z"),
              "maxValue": new Date( "2012-01-01T00:00:01.000Z")
            },
            "coverage": null
          },
          {
            "concept": "http://yavaa.org/ns/eurostat/meas/tps00058",
            "label": "Pupils learning French",
            "numeric": "numeric",
            "role": "http://purl.org/linked-data/cube#measure",
            "order": 4,
            "datatype": "numeric",
            "usedRange": {
              "minValue": 0.3,
              "maxValue": 100
            },
            "coverage": 1
          }
        ],
        "aggColumns": [
          1
        ],
        "resultOrder": {
          "2": 0,
          "3": 1,
          "4": 2
        },
        "coverage": 0.6
      },
      {
        "ds": "http://yavaa.org/ns/eurostat/dsd#tps00057",
        "dsPublisher": "http://yavaa.org/ns/Eurostat",
        "filter": {
          "2": {
            "values": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "order": 2,
            "effective": true
          }
        },
        "columns": [
          null,
          {
            "concept": "http://eurostat.linked-statistics.org/dic/indic_ed",
            "label": "Education indicator",
            "coded": "http://purl.org/linked-data/cube#CodedProperty",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 1,
            "codelist": "http://yavaa.org/ns/cl/eurostat#indic_ed_14",
            "datatype": "semantic"
          },
          {
            "concept": "http://eurostat.linked-statistics.org/dic/geo",
            "label": "Geopolitical entity (reporting)",
            "coded": "http://purl.org/linked-data/cube#CodedProperty",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 2,
            "codelist": "http://yavaa.org/ns/cl/eurostat#geo_235",
            "datatype": "semantic",
            "usedRange": [ "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#UK" ],
            "coverage": 1
          },
          {
            "time": "http://yavaa.org/ns/yavaa#instant-YYYY",
            "concept": "http://eurostat.linked-statistics.org/dic/time",
            "label": "Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)",
            "numeric": "numeric",
            "role": "http://purl.org/linked-data/cube#dimension",
            "order": 3,
            "datatype": "time",
            "usedRange": {
              "minValue": new Date( "2003-01-01T00:00:01.000Z"),
              "maxValue": new Date( "2012-01-01T00:00:01.000Z")
            },
            "coverage": null
          },
          {
            "concept": "http://yavaa.org/ns/eurostat/meas/tps00057",
            "label": "Pupils learning English",
            "numeric": "numeric",
            "role": "http://purl.org/linked-data/cube#measure",
            "order": 4,
            "datatype": "numeric",
            "usedRange": {
              "minValue": 36.2,
              "maxValue": 100
            },
            "coverage": 1
          }
        ],
        "aggColumns": [
          1
        ],
        "resultOrder": {
          "2": 0,
          "3": 1,
          "4": 4
        },
        "coverage": 0.6
      }
    ],
    
    result: { 
              op1: { 
                op1: 0, 
                op2: 1, 
                op: 'J', 
                cond: [ [ 0, 0 ], [ 1, 1 ] ] 
              },
              op2: 2,
              op: 'J',
              cond: [ [ 0, 0 ], [ 1, 1 ] ] 
            }
  }
])