"use strict";
/**
 * description for a ViolinPlot
 */
define( ['basic/Constants'], function( Constants ){

  return [

  {
    "name" : "Violin Plot",
    "preview": "ViolinPlot.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "column to categorize by",
        "id":       "cat",
        "cardinality":{
          lower: { "function": "heaviside", "threshold": 2 }
        }
      },{
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc": "values used",
        "id": "val"
      },{
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc": "occurrences",
        "id": "occ"
      }
    ],
    "testing": {
      "rowmode": "group"
    }
  }

  ];

});