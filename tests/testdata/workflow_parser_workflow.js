/**
 * test inputs for workflow/parser/workflow tests
 */
define([],[{

 /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

 label: '_:complex workflow; multiple joins',
 wf: {
    "prefix": {
      "yavaa":   "http://yavaa.org/ns/",
    },
    "entity": {
      "_:result0": {},
      "_:result1": {
        "yavaa:intermediateResult": true
      },
      "_:result2": {
        "yavaa:intermediateResult": true
      },
      "_:source3": {
        "prov:atLocation": null,
        "yavaa:type": null,
        "yavaa:datasetId": "http://yavaa.org/ns/eurostat/dsd#tps00058",
        "dct:publisher": "http://yavaa.org/ns/Eurostat",
        "dct:title": "Pupils learning French"
      },
      "_:result4": {
        "yavaa:intermediateResult": true
      },
      "_:result5": {
        "yavaa:intermediateResult": true
      },
      "_:result6": {
        "yavaa:intermediateResult": true
      },
      "_:source7": {
        "prov:atLocation": null,
        "yavaa:type": null,
        "yavaa:datasetId": "http://yavaa.org/ns/eurostat/dsd#tps00059",
        "dct:publisher": "http://yavaa.org/ns/Eurostat",
        "dct:title": "Pupils learning German"
      },
      "_:result8": {
        "yavaa:intermediateResult": true
      },
      "_:result9": {
        "yavaa:intermediateResult": true
      },
      "_:result10": {
        "yavaa:intermediateResult": true
      },
      "_:source11": {
        "prov:atLocation": null,
        "yavaa:type": null,
        "yavaa:datasetId": "http://yavaa.org/ns/eurostat/dsd#tps00057",
        "dct:publisher": "http://yavaa.org/ns/Eurostat",
        "dct:title": "Pupils learning English"
      },
      "_:result12": {
        "yavaa:intermediateResult": true
      }
    },
    "activity": {
      "_:join0": {
        "prov:startTime": "2016-12-12T10:59:29.356Z",
        "prov:endTime": "2016-12-12T10:59:29.367Z",
        "prov:type": "yavaa:join",
        "yavaa:params": "{\"base_data_id\":8,\"augm_data_id\":7,\"join_cond\":[[0,0],[1,1]]}",
        "yavaa:action": "join",
        "yavaa:columns": "[{\"former\":0,\"basedOn\":[0,4,1,5]},{\"former\":1,\"basedOn\":[0,4,1,5]},{\"former\":2,\"basedOn\":[0,4,1,5]},{\"former\":3,\"basedOn\":[0,4,1,5]},{\"former\":6,\"basedOn\":[0,4,1,5]}]",
        "yavaa:prevActivity": [
          "_:join1",
          "_:comp7"
        ]
      },
      "_:join1": {
        "prov:startTime": "2016-12-12T10:59:19.346Z",
        "prov:endTime": "2016-12-12T10:59:19.362Z",
        "prov:type": "yavaa:join",
        "yavaa:params": "{\"base_data_id\":3,\"augm_data_id\":5,\"join_cond\":[[0,0],[1,1]]}",
        "yavaa:action": "join",
        "yavaa:columns": "[{\"former\":0,\"basedOn\":[0,3,1,4]},{\"former\":1,\"basedOn\":[0,3,1,4]},{\"former\":2,\"basedOn\":[0,3,1,4]},{\"former\":5,\"basedOn\":[0,3,1,4]}]",
        "yavaa:prevActivity": [
          "_:comp2",
          "_:comp4"
        ]
      },
      "_:comp2": {
        "prov:startTime": "2016-12-12T10:58:06.308Z",
        "prov:endTime": "2016-12-12T10:58:06.320Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"columns\":[0]}",
        "yavaa:action": "dropColumns",
        "yavaa:columns": "[{\"former\":1,\"basedOn\":null,\"order\":0},{\"former\":2,\"basedOn\":null,\"order\":1},{\"former\":3,\"basedOn\":null,\"order\":2}]",
        "yavaa:prevActivity": [
          "_:load3"
        ]
      },
      "_:load3": {
        "prov:startTime": "2016-12-12T10:56:03.431Z",
        "prov:endTime": "2016-12-12T10:56:03.690Z",
        "prov:type": "yavaa:load",
        "yavaa:action": "loadData",
        "yavaa:columns": "[{\"label\":\"Education indicator\",\"order\":0,\"former\":null,\"basedOn\":null},{\"label\":\"Geopolitical entity (reporting)\",\"order\":1,\"former\":null,\"basedOn\":null},{\"label\":\"Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)\",\"order\":2,\"former\":null,\"basedOn\":null},{\"label\":\"Pupils learning French\",\"order\":3,\"former\":null,\"basedOn\":null}]",
        "yavaa:params": "{\"id\":\"http://yavaa.org/ns/eurostat/dsd#tps00058\"}",
        "yavaa:prevActivity": null
      },
      "_:comp4": {
        "prov:startTime": "2016-12-12T10:58:38.712Z",
        "prov:endTime": "2016-12-12T10:58:38.717Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"columns\":[0]}",
        "yavaa:action": "dropColumns",
        "yavaa:columns": "[{\"former\":1,\"basedOn\":null,\"order\":0},{\"former\":2,\"basedOn\":null,\"order\":1},{\"former\":3,\"basedOn\":null,\"order\":2}]",
        "yavaa:prevActivity": [
          "_:comp5"
        ]
      },
      "_:comp5": {
        "prov:startTime": "2016-12-12T10:58:34.889Z",
        "prov:endTime": "2016-12-12T10:58:34.925Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"cols\":[1,2],\"agg\":[\"bag\",null,null,\"bag\"]}",
        "yavaa:action": "aggregate",
        "yavaa:columns": "[{\"former\":0,\"basedOn\":[1,2],\"order\":0},{\"former\":1,\"basedOn\":[1,2],\"order\":1},{\"former\":2,\"basedOn\":[1,2],\"order\":2},{\"former\":3,\"basedOn\":[1,2],\"order\":3}]",
        "yavaa:prevActivity": [
          "_:load6"
        ]
      },
      "_:load6": {
        "prov:startTime": "2016-12-12T10:56:22.584Z",
        "prov:endTime": "2016-12-12T10:56:22.823Z",
        "prov:type": "yavaa:load",
        "yavaa:action": "loadData",
        "yavaa:columns": "[{\"label\":\"Education indicator\",\"order\":0,\"former\":null,\"basedOn\":null},{\"label\":\"Geopolitical entity (reporting)\",\"order\":1,\"former\":null,\"basedOn\":null},{\"label\":\"Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)\",\"order\":2,\"former\":null,\"basedOn\":null},{\"label\":\"Pupils learning German\",\"order\":3,\"former\":null,\"basedOn\":null}]",
        "yavaa:params": "{\"id\":\"http://yavaa.org/ns/eurostat/dsd#tps00059\"}",
        "yavaa:prevActivity": null
      },
      "_:comp7": {
        "prov:startTime": "2016-12-12T10:58:51.907Z",
        "prov:endTime": "2016-12-12T10:58:51.912Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"columns\":[0]}",
        "yavaa:action": "dropColumns",
        "yavaa:columns": "[{\"former\":1,\"basedOn\":null,\"order\":0},{\"former\":2,\"basedOn\":null,\"order\":1},{\"former\":3,\"basedOn\":null,\"order\":2}]",
        "yavaa:prevActivity": [
          "_:comp8"
        ]
      },
      "_:comp8": {
        "prov:startTime": "2016-12-12T10:58:48.350Z",
        "prov:endTime": "2016-12-12T10:58:48.368Z",
        "prov:type": "yavaa:comp",
        "yavaa:params": "{\"cols\":[1,2],\"agg\":[\"bag\",null,null,\"bag\"]}",
        "yavaa:action": "aggregate",
        "yavaa:columns": "[{\"former\":0,\"basedOn\":[1,2],\"order\":0},{\"former\":1,\"basedOn\":[1,2],\"order\":1},{\"former\":2,\"basedOn\":[1,2],\"order\":2},{\"former\":3,\"basedOn\":[1,2],\"order\":3}]",
        "yavaa:prevActivity": [
          "_:load9"
        ]
      },
      "_:load9": {
        "prov:startTime": "2016-12-12T10:56:35.149Z",
        "prov:endTime": "2016-12-12T10:56:35.283Z",
        "prov:type": "yavaa:load",
        "yavaa:action": "loadData",
        "yavaa:columns": "[{\"label\":\"Education indicator\",\"order\":0,\"former\":null,\"basedOn\":null},{\"label\":\"Geopolitical entity (reporting)\",\"order\":1,\"former\":null,\"basedOn\":null},{\"label\":\"Period of time (a=annual, q=quarterly, m=monthly, d=daily, c=cumulated from January)\",\"order\":2,\"former\":null,\"basedOn\":null},{\"label\":\"Pupils learning English\",\"order\":3,\"former\":null,\"basedOn\":null}]",
        "yavaa:params": "{\"id\":\"http://yavaa.org/ns/eurostat/dsd#tps00057\"}",
        "yavaa:prevActivity": null
      }
    },
    "used": {
      "_:used2": {
        "prov:activity": "_:join0",
        "prov:entity": "_:result1"
      },
      "_:used4": {
        "prov:activity": "_:join1",
        "prov:entity": "_:result2"
      },
      "_:used5": {
        "prov:activity": "_:load3",
        "prov:entity": "_:source3"
      },
      "_:used7": {
        "prov:activity": "_:comp2",
        "prov:entity": "_:result4"
      },
      "_:used9": {
        "prov:activity": "_:join1",
        "prov:entity": "_:result5"
      },
      "_:used11": {
        "prov:activity": "_:comp4",
        "prov:entity": "_:result6"
      },
      "_:used12": {
        "prov:activity": "_:load6",
        "prov:entity": "_:source7"
      },
      "_:used14": {
        "prov:activity": "_:comp5",
        "prov:entity": "_:result8"
      },
      "_:used16": {
        "prov:activity": "_:join0",
        "prov:entity": "_:result9"
      },
      "_:used18": {
        "prov:activity": "_:comp7",
        "prov:entity": "_:result10"
      },
      "_:used19": {
        "prov:activity": "_:load9",
        "prov:entity": "_:source11"
      },
      "_:used21": {
        "prov:activity": "_:comp8",
        "prov:entity": "_:result12"
      }
    },
    "wasDerivedFrom": {},
    "wasGeneratedBy": {
      "_:wasGeneratedBy0": {
        "prov:entity": "_:result0",
        "prov:activity": "_:join0"
      },
      "_:wasGeneratedBy1": {
        "prov:entity": "_:result1",
        "prov:activity": "_:join1"
      },
      "_:wasGeneratedBy3": {
        "prov:entity": "_:result2",
        "prov:activity": "_:comp2"
      },
      "_:wasGeneratedBy6": {
        "prov:entity": "_:result4",
        "prov:activity": "_:load3"
      },
      "_:wasGeneratedBy8": {
        "prov:entity": "_:result5",
        "prov:activity": "_:comp4"
      },
      "_:wasGeneratedBy10": {
        "prov:entity": "_:result6",
        "prov:activity": "_:comp5"
      },
      "_:wasGeneratedBy13": {
        "prov:entity": "_:result8",
        "prov:activity": "_:load6"
      },
      "_:wasGeneratedBy15": {
        "prov:entity": "_:result9",
        "prov:activity": "_:comp7"
      },
      "_:wasGeneratedBy17": {
        "prov:entity": "_:result10",
        "prov:activity": "_:comp8"
      },
      "_:wasGeneratedBy20": {
        "prov:entity": "_:result12",
        "prov:activity": "_:load9"
      }
    }
  },


  result: {
    stack:
      [ { level: 4,
        activity: '_:join0',
        command:
         { action: 'join',
           params:
            { base_data_id: 8,
              augm_data_id: 7,
              join_cond: [ [ 0, 0 ], [ 1, 1 ] ] } },
        uses: [ '_:join1', '_:comp7' ] },
      { level: 3,
        activity: '_:join1',
        command:
         { action: 'join',
           params:
            { base_data_id: 3,
              augm_data_id: 5,
              join_cond: [ [ 0, 0 ], [ 1, 1 ] ] } },
        uses: [ '_:comp2', '_:comp4' ] },
      { level: 2,
        activity: '_:comp7',
        command: { action: 'dropColumns', params: { columns: [ 0 ] } },
        uses: [ '_:comp8' ] },
      { level: 2,
        activity: '_:comp4',
        command: { action: 'dropColumns', params: { columns: [ 0 ] } },
        uses: [ '_:comp5' ] },
      { level: 1,
        activity: '_:comp8',
        command:
         { action: 'aggregate',
           params: { cols: [ 1, 2 ], agg: [ 'bag', null, null, 'bag' ] } },
        uses: [ '_:load9' ] },
      { level: 1,
        activity: '_:comp5',
        command:
         { action: 'aggregate',
           params: { cols: [ 1, 2 ], agg: [ 'bag', null, null, 'bag' ] } },
        uses: [ '_:load6' ] },
      { level: 1,
        activity: '_:comp2',
        command: { action: 'dropColumns', params: { columns: [ 0 ] } },
        uses: [ '_:load3' ] },
      { level: 0,
        activity: '_:load9',
        command:
         { action: 'loadData',
           params: { id: 'http://yavaa.org/ns/eurostat/dsd#tps00057' } },
        uses: null },
      { level: 0,
        activity: '_:load6',
        command:
         { action: 'loadData',
           params: { id: 'http://yavaa.org/ns/eurostat/dsd#tps00059' } },
        uses: null },
      { level: 0,
        activity: '_:load3',
        command:
         { action: 'loadData',
           params: { id: 'http://yavaa.org/ns/eurostat/dsd#tps00058' } },
        uses: null } ],
  }
}])