"use strict";
/**
 * description for a Bubble Chart
 */
define( ['basic/Constants'], function( Constants ){

  return [

   /* Categorical for x-axis */
   {
    "name" : "Bubble Chart",
    "preview": "BubbleChart.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "name of the bubble",
        "id":       "name"
      },{
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc":     "size of the bubble",
        "id":       "size",
      }
    ],
    "testing": {
      "rowmode":  "hierarchy",
      "columns": [ {values: 70 }, ]
    }
  }

  ];

});
