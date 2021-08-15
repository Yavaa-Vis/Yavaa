"use strict";
/**
 * description for a Sunburst Chart
 */
define( ['basic/Constants'], function( Constants ){

  return [

  {
    "name" : "Sunburst",
    "preview": "Sunburst.svg",
    "columnBinding" : [{
        "role" :    Constants.ROLE.DIM,
        "isarray":  true,
        "datatype": Constants.VIZDATATYPE.CATEGORICAL,
        "desc":     "hierarchies from inner to outer",
        "id":       "hierarchy"
      },{
        "role" :    Constants.ROLE.MEAS,
        "datatype": Constants.VIZDATATYPE.QUANTITATIVE,
        "desc":     "proportion of the circle segment",
        "id":       "size"
      }
    ],
    "testing": {
      "rowmode": "hierarchy"
    }
  }

  ];

});