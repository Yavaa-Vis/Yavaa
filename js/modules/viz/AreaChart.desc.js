"use strict";
/**
 * description for a Area Chart
 */
define( ['basic/Constants'], function( Constants ){

  return [

   {
    "name" : "Area Chart",
    "preview": "AreaChart.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE | Constants.VIZDATATYPE.TIME,
        "desc":     "x-axis",
        "id":       "xaxis"
      },{
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc":     "y-axis",
        "id":       "yaxis"
      }
    ],
    "testing": {
      "rowmode": "timeseries"
    }
  },

  ];

});
