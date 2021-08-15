"use strict";
/**
 * description for a ScatterPlot
 */
define( ['basic/Constants'], function( Constants ){

  return [

   /* Categorical for x-axis */
   {
    "name" : "Scatter Plot",
    "preview": "ScatterPlot.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc":     "x-axis",
        "id":       "xaxis"
      },{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc":     "y-axis",
        "id":       "yaxis"
      },{
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "distinction of markers",
        "id":       "category",
        "optional": true,
        "addBinding": [
          Constants.VIZBINDING.COLOR,
          Constants.VIZBINDING.ICON
        ],
        "cardinality":{
          upper: { "function": "heaviside", "threshold": 7 }
        }
      }
    ],
    "testing": {
      "rowmode":  "random",
      "rowcount": 50,
      "columns":[,,{ values: 7 } ],
    }
  }

  ];

});
