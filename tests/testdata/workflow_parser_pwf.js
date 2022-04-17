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
      "activity": "_:join13",
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
        "_:join8",
        "_:drop12"
      ]
    },
    {
      "activity": "_:drop12",
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
        "_:agg11"
      ]
    },
    {
      "activity": "_:agg11",
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
        "_:filter10"
      ]
    },
    {
      "activity": "_:filter10",
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
                "values": ["http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#UK"]
              }
            ]
          }
        }
      },
      "uses": [
        "_:load9"
      ]
    },
    {
      "activity": "_:load9",
      "command": {
        "action": "loadData",
        "params": {
          "id": "http://yavaa.org/ns/eurostat/dsd#tps00057"
        }
      },
      "uses": null
    },
    {
      "activity": "_:join8",
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
        "_:drop3",
        "_:drop7"
      ]
    },
    {
      "activity": "_:drop7",
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
        "_:filter6"
      ]
    },
    {
      "activity": "_:filter6",
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
                  'http://eurostat.linked-statistics.org/dic/indic_ed#L03_5'
                ]
              }
            ]
          }
        }
      },
      "uses": [
        "_:filter5"
      ]
    },
    {
      "activity": "_:filter5",
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
                  "http://eurostat.linked-statistics.org/dic/geo#DE",
                  "http://eurostat.linked-statistics.org/dic/geo#FR",
                  "http://eurostat.linked-statistics.org/dic/geo#UK"
                ],
              }
            ]
          }
        }
      },
      "uses": [
        "_:load4"
      ]
    },
    {
      "activity": "_:load4",
      "command": {
        "action": "loadData",
        "params": {
          "id": "http://yavaa.org/ns/eurostat/dsd#tps00058"
        }
      },
      "uses": null
    },
    {
      "activity": "_:drop3",
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
        "_:filter2"
      ]
    },
    {
      "activity": "_:filter2",
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
                  'http://eurostat.linked-statistics.org/dic/indic_ed#L03_8'
                ]
              }
            ]
          }
        }
      },
      "uses": [
        "_:filter1"
      ]
    },
    {
      "activity": "_:filter1",
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
                  "http://eurostat.linked-statistics.org/dic/geo#DE",
                  "http://eurostat.linked-statistics.org/dic/geo#FR",
                  "http://eurostat.linked-statistics.org/dic/geo#UK"
                ],
              }
            ]
          }
        }
      },
      "uses": [
        "_:load0"
      ]
    },
    {
      "activity": "_:load0",
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