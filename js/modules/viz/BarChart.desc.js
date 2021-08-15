"use strict";
/**
 * description for a Bar Chart
 */
define( ['basic/Constants'], function( Constants ){

  return [

   /* Categorical for x-axis */
   {
    "name" : "Bar Chart",
    "preview": "BarChart.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "multitude of columns",
        "id":       "mult",
        "optional": true,
        "addBinding": [
          Constants.VIZBINDING.COLOR,
          Constants.VIZBINDING.ICON
        ],
        "cardinality": {
          'upper': { "function": "heaviside", "threshold": 5 }
        }
      },{
        "role" :    Constants.ROLE.DIM,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
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
      "rowmode": "hierarchy",
      "columns": [{
        "values": 3
      }, ,],
    }
  },

  /* Time for x-axis */
  {
   "name" : "Bar Chart",
   "preview": "BarChart.svg",
   "columnBinding" : [{
       "role" :    Constants.ROLE.DIM,
       "datatype": Constants.VIZDATATYPE.CATEGORICAL,
       "desc":     "multitude of columns",
       "id":       "mult",
       "optional": true,
       "addBinding": [
         Constants.VIZBINDING.COLOR,
         Constants.VIZBINDING.ICON
       ],
       "cardinality": {
         'upper': { "function": "heaviside", "threshold": 7 }
       }
     },{
       "role" :    Constants.ROLE.DIM,
       "datatype": Constants.VIZDATATYPE.TIME,
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
     "rowmode": "timeseries",
     "columns": [{
       "values": 3
     }, ,],
   }
 }

  ];

});
