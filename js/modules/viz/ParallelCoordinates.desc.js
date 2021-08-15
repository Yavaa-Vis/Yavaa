"use strict";
/**
 * description for ParallelCoordinates
 */
define( ['basic/Constants'], function( Constants ){

  return [

  {
    "name" : "Parallel Coordinates",
    "preview": "ParallelCoordinates.svg",
    "columnBinding" : [
      {
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "coloring of the different lines",
        "id":       "color",
        "cardinality":{
          upper: { "function": "heaviside", "threshold": 11 }
        },
        "optional": true,
      },
      {
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL  | Constants.VIZDATATYPE.TIME | Constants.VIZDATATYPE.QUANTITATIVE,
        "isarray":  true,
        "optional": true,
        "desc":     "dimension columns",
        "id":       "dcol"
      },
      {
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL  | Constants.VIZDATATYPE.TIME | Constants.VIZDATATYPE.QUANTITATIVE,
        "isarray":  true,
        "optional": true,
        "desc":     "measurement columns",
        "id":       "mcol"
      }
    ],
    "testing": {
      "rowmode":  "random",
      "rowcount": 50,
      "columns": [{
        "values": 3
      }, ,],
    }
  }

  ];

});