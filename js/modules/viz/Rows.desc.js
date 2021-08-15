"use strict";
/**
 * description for a Row Based Layout
 */
define( ['basic/Constants'], function( Constants ){

  return [

   /* Categorical for x-axis */
   {
    "name" : "Row Layout",
    "preview": "Rows.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "Separation into rows",
        "id":       "rows",
        "cardinality":{
          upper: { "function": "heaviside", "threshold": 4 }
        }
      },{
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.VISUALIZATION,
        "desc":     "nested visualization",
        "id":       "viz"
      }
    ],
    "testing": {
      "rowmode": "random",
      "nested":  "ParallelCoordinates",
      "columns": [{
        "values": 3
      },],
    }
  }

  ];

});
