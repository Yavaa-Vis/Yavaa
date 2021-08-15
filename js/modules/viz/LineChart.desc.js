"use strict";
/**
 * description for a Line Chart
 */
define( ['basic/Constants'], function( Constants ){

  return [

   /* multiple lines given by different values in one column */
   {
    "name" : "Line Chart",
    "preview": "LineChart.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "multitude of lines",
        "id":       "mult",
        "addBinding": [
          Constants.VIZBINDING.COLOR,
          Constants.VIZBINDING.ICON
        ]
      },{
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

  /* multiple lines given by different columns */
  {
    "name" : "Line Chart",
    "preview": "LineChart.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE | Constants.VIZDATATYPE.TIME,
        "desc":     "x-axis",
        "id":       "xaxis"
      },{
        "role" :    Constants.ROLE.MEAS,
        "isarray":  true,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc":     "y-axis",
        "id":       "yaxis",
        "addBinding": [
          Constants.VIZBINDING.COLOR,
          Constants.VIZBINDING.ICON
        ]
      }
    ],
    "testing": {
      "rowmode": "timeseries"
    }
  }];

});
