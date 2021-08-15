/**
 * test data for a integration test of search/searchByCombination
 *
 * includes a query, which has to be passed to store/metadata.searchDatasetByConstraint
 * results are then passed into search/searchByCombination
 *
 */
define([], [{

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  label: 'one candidate dataset, query fully covered',

  query: [
          {"datatype":"semantic", "concept":"http://eurostat.linked-statistics.org/dic/sex","colEnums":[ "http://eurostat.linked-statistics.org/dic/sex#F" ],"minValue":null,"maxValue":null},
          {"datatype":"semantic", "concept":"http://eurostat.linked-statistics.org/dic/geo","colEnums":[ "http://eurostat.linked-statistics.org/dic/geo#FR"]},
          {"datatype":"time",     "concept":"http://eurostat.linked-statistics.org/dic/time"},
          {"datatype":"numeric",  "concept":"http://yavaa.org/ns/eurostat/meas/harmonisedUnemployment"}
        ],

  result: [
           {
             "ds": "http://yavaa.org/ns/eurostat/dsd#teilm011",
             "dsPublisher": "http://yavaa.org/ns/Eurostat",
             "filter": {
               '3': {
                 values: [ 'http://eurostat.linked-statistics.org/dic/sex#F' ],
                 order: 3,
                 effective: true
               },
               '5': {
                 values: [ 'http://eurostat.linked-statistics.org/dic/geo#FR' ],
                 order: 5,
                 effective: true
               },
             },
             "columns": [
               , {
                 coded: 'http://purl.org/linked-data/cube#CodedProperty',
                 concept: 'http://eurostat.linked-statistics.org/dic/s_adj',
                 label: 'Seasonal adjustment',
                 role: 'http://purl.org/linked-data/cube#dimension',
                 order: 1,
                 datatype: 'semantic'
               }, {
                 coded: 'http://purl.org/linked-data/cube#CodedProperty',
                 concept: 'http://eurostat.linked-statistics.org/dic/age',
                 label: 'Age class',
                 role: 'http://purl.org/linked-data/cube#dimension',
                 order: 2,
                 datatype: 'semantic'
               }, {
                 coded: 'http://purl.org/linked-data/cube#CodedProperty',
                 concept: 'http://eurostat.linked-statistics.org/dic/sex',
                 label: 'Sex',
                 role: 'http://purl.org/linked-data/cube#dimension',
                 order: 3,
                 datatype: 'semantic',
                 usedRange: [ 'http://eurostat.linked-statistics.org/dic/sex#F' ],
               }, {
                 coded: 'http://purl.org/linked-data/cube#CodedProperty',
                 concept: 'http://eurostat.linked-statistics.org/dic/unit',
                 label: 'Unit of measure',
                 role: 'http://purl.org/linked-data/cube#dimension',
                 order: 4,
                 datatype: 'semantic'
               }, {
                 coded: 'http://purl.org/linked-data/cube#CodedProperty',
                 concept: 'http://eurostat.linked-statistics.org/dic/geo',
                 label: 'Geopolitical entity (reporting)',
                 role: 'http://purl.org/linked-data/cube#dimension',
                 order: 5,
                 datatype: 'semantic',
                 usedRange: [ 'http://eurostat.linked-statistics.org/dic/geo#FR' ],
               }, {
                 concept: 'http://eurostat.linked-statistics.org/dic/time',
                 label: 'Time',
                 time: 'http://yavaa.org/ns/yavaa#instant-YYYY_MM',
                 role: 'http://purl.org/linked-data/cube#dimension',
                 order: 6,
                 datatype: 'time',
               }, {
                 concept: 'http://yavaa.org/ns/eurostat/meas/harmonisedUnemployment',
                 numeric: 'numeric',
                 label: 'Harmonised unemployment',
                 role: 'http://purl.org/linked-data/cube#measure',
                 order: 7,
                 datatype: 'numeric',
               }
             ],
             'aggColumns': [ 1, 2, 4 ],
             'resultOrder': { '3': 0, '5': 1, '6': 2, '7': 3 },
           }
         ]

},{

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  label: 'two candidate datasets, query fully covered',

  comment: 'currently can not be joined as the time columns can not be matched',
  executable: false,

  query: [
          {"datatype":"semantic", "concept":"http://eurostat.linked-statistics.org/dic/sex","colEnums":[ "http://eurostat.linked-statistics.org/dic/sex#F" ],"minValue":null,"maxValue":null},
          {"datatype":"semantic", "concept":"http://eurostat.linked-statistics.org/dic/geo","colEnums":[ "http://eurostat.linked-statistics.org/dic/geo#FR"]},
          {"datatype":"time",     "concept":"http://eurostat.linked-statistics.org/dic/time"},
          {"datatype":"numeric",  "concept":"http://yavaa.org/ns/eurostat/meas/harmonisedUnemployment"},
          {"datatype":"numeric",  "concept":"http://yavaa.org/ns/eurostat/meas/populationOn1January"}
        ],

  result: [
           {
             "ds": "http://yavaa.org/ns/eurostat/dsd#teilm010",
             "dsPublisher": "http://yavaa.org/ns/Eurostat",
             "filter": {
               "1": {
                 "values": [
                   "http://eurostat.linked-statistics.org/dic/sex#F"
                 ],
                 "order": 1,
                 "effective": true
               }
             },
             "columns": [
               ,
               {
                 "concept": "http://eurostat.linked-statistics.org/dic/sex",
                 "coded": "http://purl.org/linked-data/cube#CodedProperty",
                 "type": "http://purl.org/linked-data/cube#dimension",
                 "order": 1,
                 "semantic": "http://yavaa.org/ns/cl/eurostat#sex_1",
                 "datatype": "semantic",
                 "usedRange": [
                   "http://eurostat.linked-statistics.org/dic/sex#F"
                 ],
                 "coverage": 1
               },
               {
                 "concept": "http://eurostat.linked-statistics.org/dic/geo",
                 "coded": "http://purl.org/linked-data/cube#CodedProperty",
                 "type": "http://purl.org/linked-data/cube#dimension",
                 "order": 2,
                 "semantic": "http://yavaa.org/ns/cl/eurostat#geo_433",
                 "datatype": "semantic"
               },
               {
                 "time": "http://yavaa.org/ns/yavaa#instant-YYYY_MM",
                 "concept": "http://eurostat.linked-statistics.org/dic/time",
                 "numeric": "numeric",
                 "type": "http://purl.org/linked-data/cube#dimension",
                 "order": 3,
                 "datatype": "time",
                 "coverage": 0.07510058113544926
               },
               {
                 "concept": "http://yavaa.org/ns/eurostat/meas/harmonisedUnemployment",
                 "numeric": "numeric",
                 "type": "http://purl.org/linked-data/cube#measure",
                 "order": 4,
                 "datatype": "numeric",
                 "coverage": 1
               }
             ],
             "aggColumns": [ 2 ],
             "resultOrder": {
               "1": 0,
               "3": 1,
               "4": 2
             },
             "coverage": 0.05632543585158695
           },
           {
             "ds": "http://yavaa.org/ns/eurostat/dsd#tps00001",
             "dsPublisher": "http://yavaa.org/ns/Eurostat",
             "filter": {},
             "columns": [
               ,
               {
                 "concept": "http://eurostat.linked-statistics.org/dic/indic_de",
                 "coded": "http://purl.org/linked-data/cube#CodedProperty",
                 "type": "http://purl.org/linked-data/cube#dimension",
                 "order": 1,
                 "semantic": "http://yavaa.org/ns/cl/eurostat#indic_de_14",
                 "datatype": "semantic"
               },
               {
                 "concept": "http://eurostat.linked-statistics.org/dic/geo",
                 "coded": "http://purl.org/linked-data/cube#CodedProperty",
                 "type": "http://purl.org/linked-data/cube#dimension",
                 "order": 2,
                 "semantic": "http://yavaa.org/ns/cl/eurostat#geo_228",
                 "datatype": "semantic"
               },
               {
                 "time": "http://yavaa.org/ns/yavaa#instant-YYYY",
                 "concept": "http://eurostat.linked-statistics.org/dic/time",
                 "numeric": "numeric",
                 "type": "http://purl.org/linked-data/cube#dimension",
                 "order": 3,
                 "datatype": "time",
                 "coverage": 0.8980777827447475
               },
               {
                 "concept": "http://yavaa.org/ns/eurostat/meas/populationOn1January",
                 "numeric": "numeric",
                 "type": "http://purl.org/linked-data/cube#measure",
                 "order": 4,
                 "datatype": "numeric",
                 "coverage": 1
               }
             ],
             "aggColumns": [
               1,
               2
             ],
             "resultOrder": {
               "3": 1,
               "4": 3
             },
             "coverage": 0.44903889137237374
           }
         ]

},{

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  label: 'unfulfillable query',

  query: [
          {"datatype":"semantic", "concept":"http://eurostat.linked-statistics.org/dic/sex","colEnums":[ "http://eurostat.linked-statistics.org/dic/sex#F" ],"minValue":null,"maxValue":null},
          {"datatype":"numeric",  "concept":"http://yavaa.org/ns/NonExistantColumn"}
        ],

  result: false,

},{

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  label: 'Issue: combine 3 datasets with filters',

  query: [
          { "datatype": "semantic", "concept": "http://eurostat.linked-statistics.org/dic/geo", "colEnums": ["http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#UK"], "minValue": null, "maxValue": null },
          { "datatype": "time", "concept": "http://eurostat.linked-statistics.org/dic/time", "colEnums": null },
          { "datatype": "numeric", "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningEnglish", "colEnums": null },
          { "datatype": "numeric", "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningFrench", "colEnums": null },
          { "datatype": "numeric", "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman", "colEnums": null }
        ],

  result: [],
  uniqueComponents: true,

}]);