"use strict";
/**
 * description for a Matrix Layout
 */
define( ['basic/Constants'], function( Constants ){

  return [

   /* Categorical for x-axis */
   {
    "name" : "Matrix Layout",
    "preview": "Matrix.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "Separation into columns",
        "id":       "cols",
        "cardinality":{
          upper: { "function": "heaviside", "threshold": 4 }
        }
      },{
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
      "rowcount": 300,
      "nested":  "ScatterPlot",
      "columns": [{
        "values": 3
      },{
        "values": 3
      },],
    }
  }

  ];

});
