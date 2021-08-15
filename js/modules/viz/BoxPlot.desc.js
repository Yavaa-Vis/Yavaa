"use strict";
/**
 * description for a BoxPlot
 */
define( ['basic/Constants'], function( Constants ){

  return [

  {
    "name" : "Box Plot",
    "preview": "BoxPlot.svg",
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
      }
    ],
    "testing": {
      "rowmode": "group"
    }
  }

  ];

});