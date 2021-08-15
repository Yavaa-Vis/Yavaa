/**
 * test inputs for workflow/parser/workflow tests
 */
define([],[{
  
 /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

 label: 'Complex workflow; multiple joins',
 wf: {
    "entities": {
      "result0": {},
      "result1": {
        "yavaa:intermediateResult": true
      },
      "result2": {
        "yavaa:intermediateResult": true
      },
      "source3": {
        "prov:atLocation": null,
        "yavaa:type": null,
        "yavaa:datasetId": "http://yavaa.org/ns/eurostat/dsd#tps00058",
        "dct:publisher": "http://yavaa.org/ns/Eurostat",
        "dct:title": "Pupils learning French"
      },
      "result4": {
        "yavaa:intermediateResult": true
      },
      "result5": {
        "yavaa:intermediateResult": true
      },
      "result6": {
        "yavaa:intermediateResult": true
      },
      "source7": {
        "prov:atLocation": null,
        "yavaa:type": null,
        "yavaa:datasetId": "http://yavaa.org/ns/eurostat/dsd#tps00059",
        "dct:publisher": "http://yavaa.org/ns/Eurostat",
        "dct:title": "Pupils learning German"
      },
      "result8": {
        "yavaa:intermediateResult": true
      },
      "result9": {
        "yavaa:intermediateResult": true
      },
      "result10": {
        "yavaa:intermediateResult": true
      },
      "source11": {
        "prov:atLocation": null,
        "yavaa:type": null,
        "yavaa:datasetId": "http://yavaa.org/ns/eurostat/dsd#tps00057",
        "dct:publisher": "http://yavaa.org/ns/Eurostat",
        "dct:title": "Pupils learning English"
      },
      "result12": {
        "yavaa:intermediateResult": true
      }
    },
    "activities": {
      "join0": {
        "prov:startTime": "2016-12-12T10:59:29.356Z",
        "prov:endTime": "2016-12-12T10:59:29.367Z",
        "prov:type": "yavaa:join",
        "yavaa:params": "{\"base_data_id\":8,\"augm_data_id\":7,\"join_cond\":[[0,0],[1,1]]}",
        "yavaa:action": "join",
        "yavaa:columns": [
          {
            "former": 0,
            "basedOn": [
              0,
              4,
              1,
              5
            ]
          },
          {
            "former": 1,
            "basedOn": [
              0,
              4,
              1,
              5
            ]
          },
          {
            "former": 2,
            "basedOn": [
              0,
              4,
              1,
              5
            ]
          },
          {
            "former": 3,
            "basedOn": [
              0,
              4,
              1,
              5
            ]
          },
          {
            "former": 6,
            "basedOn": [
              0,
              4,
              1,
              5
            ]
          }
        ],
        "yavaa:prevActivity": [
          "join1",
          "comp7"
        ]
      },
      "join1": {
        "prov:startTime": "2016-12-12T10:59:19.346Z",
        "prov:endTime": "2016-12-12T10:59:19.362Z",
        "prov:type": "yavaa:join",
        "yavaa:params": "{\"base_data_id\":3,\"augm_data_id\":5,\"join_cond\":[[0,0],[1,1]]}",
        "yavaa:action": "join",
        "yavaa:columns": [
          {
            "former": 0,
            "basedOn": [
              0,
              3,
              1,
              4
            ]
          },
          {
            "former": 1,
            "basedOn": [
              0,
              3,
              1,
              4
            ]
          },
          {
            "former": 2,
            "basedOn": [
              0,
              3,
              1,
              4
            ]
          },
          {
            "former": 5,
            "basedOn": [
              0,
              3,
              1,
              4
            ]
          }
        ],
        "yavaa:prevActivity": [
          "comp2",
          "comp4"
        ]
      },
      "comp2": {
        "prov:startTime": "2016-12-12T10:58:06.308Z",
        "prov:endTime": "2016-12-12T10:58:06.320Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"columns\":[0]}",
        "yavaa:action": "dropColumns",
        "yavaa:columns": [
          {
            "former": 1,
            "basedOn": null,
            "order": 0
          },
          {
            "former": 2,
            "basedOn": null,
            "order": 1
          },
          {
            "former": 3,
            "basedOn": null,
            "order": 2
          }
        ],
        "yavaa:prevActivity": [
          "load3"
        ]
      },
      "load3": {
        "prov:startTime": "2016-12-12T10:56:03.431Z",
        "prov:endTime": "2016-12-12T10:56:03.690Z",
        "prov:type": "yavaa:load",
        "yavaa:action": "loadData",
        "yavaa:columns": [
          {
            "label": "Education indicator",
            "order": 0,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Geopolitical entity (reporting)",
            "order": 1,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)",
            "order": 2,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Pupils learning French",
            "order": 3,
            "former": null,
            "basedOn": null
          }
        ],
        "yavaa:params": "{\"id\":\"http://yavaa.org/ns/eurostat/dsd#tps00058\"}",
        "yavaa:prevActivity": null
      },
      "comp4": {
        "prov:startTime": "2016-12-12T10:58:38.712Z",
        "prov:endTime": "2016-12-12T10:58:38.717Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"columns\":[0]}",
        "yavaa:action": "dropColumns",
        "yavaa:columns": [
          {
            "former": 1,
            "basedOn": null,
            "order": 0
          },
          {
            "former": 2,
            "basedOn": null,
            "order": 1
          },
          {
            "former": 3,
            "basedOn": null,
            "order": 2
          }
        ],
        "yavaa:prevActivity": [
          "comp5"
        ]
      },
      "comp5": {
        "prov:startTime": "2016-12-12T10:58:34.889Z",
        "prov:endTime": "2016-12-12T10:58:34.925Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"cols\":[1,2],\"agg\":[\"bag\",null,null,\"bag\"]}",
        "yavaa:action": "aggregate",
        "yavaa:columns": [
          {
            "former": 0,
            "basedOn": [
              1,
              2
            ],
            "order": 0
          },
          {
            "former": 1,
            "basedOn": [
              1,
              2
            ],
            "order": 1
          },
          {
            "former": 2,
            "basedOn": [
              1,
              2
            ],
            "order": 2
          },
          {
            "former": 3,
            "basedOn": [
              1,
              2
            ],
            "order": 3
          }
        ],
        "yavaa:prevActivity": [
          "load6"
        ]
      },
      "load6": {
        "prov:startTime": "2016-12-12T10:56:22.584Z",
        "prov:endTime": "2016-12-12T10:56:22.823Z",
        "prov:type": "yavaa:load",
        "yavaa:action": "loadData",
        "yavaa:columns": [
          {
            "label": "Education indicator",
            "order": 0,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Geopolitical entity (reporting)",
            "order": 1,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)",
            "order": 2,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Pupils learning German",
            "order": 3,
            "former": null,
            "basedOn": null
          }
        ],
        "yavaa:params": "{\"id\":\"http://yavaa.org/ns/eurostat/dsd#tps00059\"}",
        "yavaa:prevActivity": null
      },
      "comp7": {
        "prov:startTime": "2016-12-12T10:58:51.907Z",
        "prov:endTime": "2016-12-12T10:58:51.912Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"columns\":[0]}",
        "yavaa:action": "dropColumns",
        "yavaa:columns": [
          {
            "former": 1,
            "basedOn": null,
            "order": 0
          },
          {
            "former": 2,
            "basedOn": null,
            "order": 1
          },
          {
            "former": 3,
            "basedOn": null,
            "order": 2
          }
        ],
        "yavaa:prevActivity": [
          "comp8"
        ]
      },
      "comp8": {
        "prov:startTime": "2016-12-12T10:58:48.350Z",
        "prov:endTime": "2016-12-12T10:58:48.368Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"cols\":[1,2],\"agg\":[\"bag\",null,null,\"bag\"]}",
        "yavaa:action": "aggregate",
        "yavaa:columns": [
          {
            "former": 0,
            "basedOn": [
              1,
              2
            ],
            "order": 0
          },
          {
            "former": 1,
            "basedOn": [
              1,
              2
            ],
            "order": 1
          },
          {
            "former": 2,
            "basedOn": [
              1,
              2
            ],
            "order": 2
          },
          {
            "former": 3,
            "basedOn": [
              1,
              2
            ],
            "order": 3
          }
        ],
        "yavaa:prevActivity": [
          "load9"
        ]
      },
      "load9": {
        "prov:startTime": "2016-12-12T10:56:35.149Z",
        "prov:endTime": "2016-12-12T10:56:35.283Z",
        "prov:type": "yavaa:load",
        "yavaa:action": "loadData",
        "yavaa:columns": [
          {
            "label": "Education indicator",
            "order": 0,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Geopolitical entity (reporting)",
            "order": 1,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)",
            "order": 2,
            "former": null,
            "basedOn": null
          },
          {
            "label": "Pupils learning English",
            "order": 3,
            "former": null,
            "basedOn": null
          }
        ],
        "yavaa:params": "{\"id\":\"http://yavaa.org/ns/eurostat/dsd#tps00057\"}",
        "yavaa:prevActivity": null
      }
    },
    "used": {
      "used2": {
        "prov:activity": "join0",
        "prov:entity": "result1"
      },
      "used4": {
        "prov:activity": "join1",
        "prov:entity": "result2"
      },
      "used5": {
        "prov:activity": "load3",
        "prov:entity": "source3"
      },
      "used7": {
        "prov:activity": "comp2",
        "prov:entity": "result4"
      },
      "used9": {
        "prov:activity": "join1",
        "prov:entity": "result5"
      },
      "used11": {
        "prov:activity": "comp4",
        "prov:entity": "result6"
      },
      "used12": {
        "prov:activity": "load6",
        "prov:entity": "source7"
      },
      "used14": {
        "prov:activity": "comp5",
        "prov:entity": "result8"
      },
      "used16": {
        "prov:activity": "join0",
        "prov:entity": "result9"
      },
      "used18": {
        "prov:activity": "comp7",
        "prov:entity": "result10"
      },
      "used19": {
        "prov:activity": "load9",
        "prov:entity": "source11"
      },
      "used21": {
        "prov:activity": "comp8",
        "prov:entity": "result12"
      }
    },
    "wasDerivedFrom": {},
    "wasGeneratedBy": {
      "wasGeneratedBy0": {
        "prov:entity": "result0",
        "prov:activity": "join0"
      },
      "wasGeneratedBy1": {
        "prov:entity": "result1",
        "prov:activity": "join1"
      },
      "wasGeneratedBy3": {
        "prov:entity": "result2",
        "prov:activity": "comp2"
      },
      "wasGeneratedBy6": {
        "prov:entity": "result4",
        "prov:activity": "load3"
      },
      "wasGeneratedBy8": {
        "prov:entity": "result5",
        "prov:activity": "comp4"
      },
      "wasGeneratedBy10": {
        "prov:entity": "result6",
        "prov:activity": "comp5"
      },
      "wasGeneratedBy13": {
        "prov:entity": "result8",
        "prov:activity": "load6"
      },
      "wasGeneratedBy15": {
        "prov:entity": "result9",
        "prov:activity": "comp7"
      },
      "wasGeneratedBy17": {
        "prov:entity": "result10",
        "prov:activity": "comp8"
      },
      "wasGeneratedBy20": {
        "prov:entity": "result12",
        "prov:activity": "load9"
      }
    }
  },
  
  
  result: { 
    stack:  
      [ { level: 4,
        activity: 'join0',
        command:
         { action: 'join',
           params:
            { base_data_id: 8,
              augm_data_id: 7,
              join_cond: [ [ 0, 0 ], [ 1, 1 ] ] } },
        uses: [ 'join1', 'comp7' ] },
      { level: 3,
        activity: 'join1',
        command:
         { action: 'join',
           params:
            { base_data_id: 3,
              augm_data_id: 5,
              join_cond: [ [ 0, 0 ], [ 1, 1 ] ] } },
        uses: [ 'comp2', 'comp4' ] },
      { level: 2,
        activity: 'comp7',
        command: { action: 'dropColumns', params: { columns: [ 0 ] } },
        uses: [ 'comp8' ] },
      { level: 2,
        activity: 'comp4',
        command: { action: 'dropColumns', params: { columns: [ 0 ] } },
        uses: [ 'comp5' ] },
      { level: 1,
        activity: 'comp8',
        command:
         { action: 'aggregate',
           params: { cols: [ 1, 2 ], agg: [ 'bag', null, null, 'bag' ] } },
        uses: [ 'load9' ] },
      { level: 1,
        activity: 'comp5',
        command:
         { action: 'aggregate',
           params: { cols: [ 1, 2 ], agg: [ 'bag', null, null, 'bag' ] } },
        uses: [ 'load6' ] },
      { level: 1,
        activity: 'comp2',
        command: { action: 'dropColumns', params: { columns: [ 0 ] } },
        uses: [ 'load3' ] },
      { level: 0,
        activity: 'load9',
        command:
         { action: 'loadData',
           params: { id: 'http://yavaa.org/ns/eurostat/dsd#tps00057' } },
        uses: null },
      { level: 0,
        activity: 'load6',
        command:
         { action: 'loadData',
           params: { id: 'http://yavaa.org/ns/eurostat/dsd#tps00059' } },
        uses: null },
      { level: 0,
        activity: 'load3',
        command:
         { action: 'loadData',
           params: { id: 'http://yavaa.org/ns/eurostat/dsd#tps00058' } },
        uses: null } ],
  }
}])