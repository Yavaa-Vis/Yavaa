/**
 * test inputs for metastore.sparql/searchDatasetByConstraint test
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
define([], [{

  /* ------------------------------------------------------------------------------------------- */

  label: 'Simple Test: Single Result',

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Query XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  query: {
    constraints: [{
        datatype: 'semantic',
        concept:  'http://eurostat.linked-statistics.org/dic/sex',
        minValue:  null,
        maxValue:  null,
        colEnums: [ 'http://eurostat.linked-statistics.org/dic/sex#M' ]
      },{
        datatype:  'semantic',
        concept:   'http://eurostat.linked-statistics.org/dic/geo',
        minValue:  null,
        maxValue:  null
      },{
        datatype:  'numeric',
        concept:   'http://yavaa.org/ns/eurostat/meas/harmonisedUnemployment',
        minValue:  null,
        maxValue:  null,
        colEnums:  null
      }
    ]
  },

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Result XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  result:  {
             "ds": "http://yavaa.org/ns/eurostat/dsd#teilm010",
             "covers": [
               {
                 "concept": "http://eurostat.linked-statistics.org/dic/sex",
                 "minValue": null,
                 "maxValue": null,
                 "isMeas": false,
                 "colEnums": [
                   "http://eurostat.linked-statistics.org/dic/sex#M"
                 ]
               },
               {
                 "concept": "http://eurostat.linked-statistics.org/dic/geo",
                 "minValue": null,
                 "maxValue": null,
                 "isMeas": false,
               },
               {
                 "concept": "http://yavaa.org/ns/eurostat/meas/harmonisedUnemployment",
                 "isMeas": true,
                 "colEnums": null
               }
             ],
             "measureCount": 1
           }

},{

  /* ------------------------------------------------------------------------------------------- */

  label: 'Simple Test: Single Result; no value constraints used',

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Query XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  query: {
    constraints: [
      { "datatype" : 'semantic', "concept" : "http://eurostat.linked-statistics.org/dic/geo", "colEnums" : [], "minValue" : null, "maxValue" : null },
      { "datatype" : "numeric", "concept" : "http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman", "colEnums" : null, "minValue" : null, "maxValue" : null }
     ]
  },

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Result XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  result:   {
              "ds": "http://yavaa.org/ns/eurostat/dsd#tps00059",
              "covers": [
                {
                  "concept": "http://eurostat.linked-statistics.org/dic/geo",
                  "minValue": null,
                  "maxValue": null,
                  "isMeas": false,
                },
                {
                  "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman",
                  "colEnums": null,
                }
              ],
              "measureCount": 1
            }


},{

  /* ------------------------------------------------------------------------------------------- */

  label: 'Simple Test: No Results',

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Query XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  query: {
    constraints: [
      { "datatype" : 'semantic', "concept" : "http://eurostat.linked-statistics.org/dic/geo", "colEnums" : [], "minValue" : null, "maxValue" : null },
      { "datatype" : "numeric", "concept" : "http://yavaa.org/ns/NonExistantColumn", "colEnums" : null, "minValue" : null, "maxValue" : null }
     ]
  },

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Result XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  result: false

}, {

  /* ------------------------------------------------------------------------------------------- */

  label: 'Extended Test: Multiple Results; value constraints used',

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Query XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  query: {
    constraints: [
      {
        "datatype": "semantic",
        "concept": "http://eurostat.linked-statistics.org/dic/geo",
        "colEnums": ["http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#UK"],
        "minValue": null,
        "maxValue": null
      }, {
        "datatype": "time",
        "concept": "http://eurostat.linked-statistics.org/dic/time",
        "colEnums": null,
        "minValue": 1277071260000,
        "maxValue": 1372024860000
      }, {
        "datatype": "numeric",
        "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningEnglish",
        "colEnums": null
      }, {
        "datatype": "numeric",
        "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningFrench",
        "colEnums": null
      }, {
        "datatype": "numeric",
        "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman",
        "colEnums": null
      }]
  },

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Result XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  result:   {
              "ds": "http://yavaa.org/ns/eurostat/dsd#tps00059",
              "covers": [
                {
                  "concept": "http://eurostat.linked-statistics.org/dic/geo",
                  "isMeas": false,
                }, {
                  "concept": "http://eurostat.linked-statistics.org/dic/time",
                  "isMeas": false,
                }, {
                  "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman",
                  "isMeas": true,
                }
              ],
              "measureCount": 1
            }


},]);