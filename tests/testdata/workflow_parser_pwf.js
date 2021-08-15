/**
 * test inputs for workflow/parser/workflow tests
 */
define([],[{
  
 /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

 label: 'Complex workflow; multiple joins',
 wf: {
       "op1" : {
         "op1" : {
           "op" : "D",
           "param" : [1],
           "op1" : {
             "op" : "F",
             "param" : [{
                 "uri" : "http://eurostat.linked-statistics.org/dic/indic_ed",
                 "col" : 0,
                 "values" : ["http://eurostat.linked-statistics.org/dic/indic_ed#L03_8"],
                 "codelist" : "http://yavaa.org/ns/cl/eurostat#indic_ed_12"
               }
             ],
             "op1" : {
               "op" : "F",
               "param" : [{
                   "values" : ["http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#UK"],
                   "effective" : true,
                   "codelist" : "http://yavaa.org/ns/cl/eurostat#geo_235",
                   "col" : 1
                 }
               ],
               "op1" : {
                 "op" : "L",
                 "ds" : "http://yavaa.org/ns/eurostat/dsd#tps00059"
               }
             }
           }
         },
         "op2" : {
           "op" : "D",
           "param" : [1],
           "op1" : {
             "op" : "F",
             "param" : [{
                 "uri" : "http://eurostat.linked-statistics.org/dic/indic_ed",
                 "col" : 0,
                 "values" : ["http://eurostat.linked-statistics.org/dic/indic_ed#L03_5"],
                 "codelist" : "http://yavaa.org/ns/cl/eurostat#indic_ed_13"
               }
             ],
             "op1" : {
               "op" : "F",
               "param" : [{
                   "values" : ["http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#UK"],
                   "effective" : true,
                   "codelist" : "http://yavaa.org/ns/cl/eurostat#geo_235",
                   "col" : 1
                 }
               ],
               "op1" : {
                 "op" : "L",
                 "ds" : "http://yavaa.org/ns/eurostat/dsd#tps00058"
               }
             }
           }
         },
         "op" : "J",
         "cond" : [[0, 0], [1, 1]]
       },
       "op2" : {
         "op" : "D",
         "param" : [1],
         "op1" : {
           "op" : "A",
           "param" : {
             "agg" : [{
                 "uri" : "http://yavaa.org/ns/eurostat/meas/tps00057",
                 "col" : 3,
                 "aggFkt" : "bag"
               }
             ],
             "remCols" : [0],
             "aggCols" : [3],
             "groupByCols" : [1, 2]
           },
           "op1" : {
             "op" : "F",
             "param" : [{
                 "values" : ["http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#UK"],
                 "effective" : true,
                 "codelist" : "http://yavaa.org/ns/cl/eurostat#geo_235",
                 "col" : 1
               }
             ],
             "op1" : {
               "op" : "L",
               "ds" : "http://yavaa.org/ns/eurostat/dsd#tps00057"
             }
           }
         }
       },
       "op" : "J",
       "cond" : [[0, 0], [1, 1]]
     },

  result: [
    {
      "activity": "join13",
      "command": {
        "action": "join",
        "params": {
          "base_data_id": null,
          "augm_data_id": null,
          "join_cond": [
            [
              0,
              0
            ],
            [
              1,
              1
            ]
          ]
        }
      },
      "uses": [
        "join8",
        "drop12"
      ]
    },
    {
      "activity": "drop12",
      "command": {
        "action": "dropColumns",
        "params": {
          "data_id": null,
          "columns": [
            0
          ]
        }
      },
      "uses": [
        "agg11"
      ]
    },
    {
      "activity": "agg11",
      "command": {
        "action": "aggregate",
        "params": {
          "data_id": null,
          "cols": [
            1,
            2
          ],
          "agg": [ "bag", null, null,"bag" ]
        }
      },
      "uses": [
        "filter10"
      ]
    },
    {
      "activity": "filter10",
      "command": {
        "action": "filterData",
        "params": {
          "data_id": null,
          "filterDef": {
            "operator": "and",
            "values": [
              {
                "operator": "EntityFilter",
                "include": true,
                "column": 1,
                "values": [
                  "DE",
                  "FR",
                  "UK"
                ]
              }
            ]
          }
        }
      },
      "uses": [
        "load9"
      ]
    },
    {
      "activity": "load9",
      "command": {
        "action": "loadData",
        "params": {
          "id": "http://yavaa.org/ns/eurostat/dsd#tps00057"
        }
      },
      "uses": null
    },
    {
      "activity": "join8",
      "command": {
        "action": "join",
        "params": {
          "base_data_id": null,
          "augm_data_id": null,
          "join_cond": [
            [
              0,
              0
            ],
            [
              1,
              1
            ]
          ]
        }
      },
      "uses": [
        "drop3",
        "drop7"
      ]
    },
    {
      "activity": "drop7",
      "command": {
        "action": "dropColumns",
        "params": {
          "data_id": null,
          "columns": [
            0
          ]
        }
      },
      "uses": [
        "filter6"
      ]
    },
    {
      "activity": "filter6",
      "command": {
        "action": "filterData",
        "params": {
          "data_id": null,
          "filterDef": {
            "operator": "and",
            "values": [
              {
                "operator": "EntityFilter",
                "include": true,
                "column": 0,
                "values": [
                  "L03_5"
                ]
              }
            ]
          }
        }
      },
      "uses": [
        "filter5"
      ]
    },
    {
      "activity": "filter5",
      "command": {
        "action": "filterData",
        "params": {
          "data_id": null,
          "filterDef": {
            "operator": "and",
            "values": [
              {
                "operator": "EntityFilter",
                "include": true,
                "column": 1,
                "values": [
                  "DE",
                  "FR",
                  "UK"
                ]
              }
            ]
          }
        }
      },
      "uses": [
        "load4"
      ]
    },
    {
      "activity": "load4",
      "command": {
        "action": "loadData",
        "params": {
          "id": "http://yavaa.org/ns/eurostat/dsd#tps00058"
        }
      },
      "uses": null
    },
    {
      "activity": "drop3",
      "command": {
        "action": "dropColumns",
        "params": {
          "data_id": null,
          "columns": [
            0
          ]
        }
      },
      "uses": [
        "filter2"
      ]
    },
    {
      "activity": "filter2",
      "command": {
        "action": "filterData",
        "params": {
          "data_id": null,
          "filterDef": {
            "operator": "and",
            "values": [
              {
                "operator": "EntityFilter",
                "include": true,
                "column": 0,
                "values": [
                  "L03_8"
                ]
              }
            ]
          }
        }
      },
      "uses": [
        "filter1"
      ]
    },
    {
      "activity": "filter1",
      "command": {
        "action": "filterData",
        "params": {
          "data_id": null,
          "filterDef": {
            "operator": "and",
            "values": [
              {
                "operator": "EntityFilter",
                "include": true,
                "column": 1,
                "values": [
                  "DE",
                  "FR",
                  "UK"
                ]
              }
            ]
          }
        }
      },
      "uses": [
        "load0"
      ]
    },
    {
      "activity": "load0",
      "command": {
        "action": "loadData",
        "params": {
          "id": "http://yavaa.org/ns/eurostat/dsd#tps00059"
        }
      },
      "uses": null
    }
  ]

}])