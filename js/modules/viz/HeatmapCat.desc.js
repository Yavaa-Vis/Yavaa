"use strict";
/**
 * description for a Heatmap (categorical)
 */
define( ['basic/Constants'], function( Constants ){

  return [

   /* Categorical for x-axis */
   {
    "name" : "Heatmap (categorical)",
    "preview": "Heatmap.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "x-axis",
        "id":       "xaxis"
      },{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "y-axis",
        "id":       "yaxis"
      },{
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc":     "measurement value",
        "id":       "value",
        "addBinding": [
          Constants.VIZBINDING.COLOR,
          Constants.VIZBINDING.ICON
        ],
      }
    ],
    "testing": {
      "rowmode":  "hierarchy",
    }
  }

  ];

});
