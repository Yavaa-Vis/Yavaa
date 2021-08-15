/**
 * test inputs for search by combination tests
 */
define([ 'basic/Constants' ], function( Constants ){
  return {
	/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Numeric: fixed ENDS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    '1ColNumeric_0to10':[{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'numericCol',
      "minValue":   0,
      "maxValue":   10,
      "isMeas":     false,
      "colEnums":   null,
      "order":      0
    }],
    '1ColNumeric_0to5':[{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'numericCol',
      "minValue":   0,
      "maxValue":   5,
      "isMeas":     false,
      "colEnums":   null,
      "order":      0
     }],
     '1ColNumeric_5to10':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   5,
       "maxValue":   10,
       "isMeas":     false,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_-5to5':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   -5,
       "maxValue":   5,
       "isMeas":     false,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_5to20':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   5,
       "maxValue":   20,
       "isMeas":     false,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_3to8':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   3,
       "maxValue":   8,
       "isMeas":     false,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_0to3':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   0,
       "maxValue":   3,
       "isMeas":     false,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_8to10':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   8,
       "maxValue":   10,
       "isMeas":     false,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_10to20':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   10,
       "maxValue":   20,
       "isMeas":     false,
       "colEnums":   null,
       "order":      0
     }],

	 /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Numeric: OPEN ENDED XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

     '1ColNumeric_to10':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   null,
       "maxValue":   10,
       "isMeas":     true,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_to5':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   null,
       "maxValue":   null,
       "isMeas":     true,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_to0':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   null,
       "maxValue":   0,
       "isMeas":     true,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_from0':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   0,
       "maxValue":   null,
       "isMeas":     true,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_from5':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   0,
       "maxValue":   null,
       "isMeas":     true,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_from10':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   10,
       "maxValue":   null,
       "isMeas":     true,
       "colEnums":   null,
       "order":      0
     }],
     '1ColNumeric_open':[{
       "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   null,
       "maxValue":   null,
       "isMeas":     true,
       "colEnums":   null,
       "order":      0
     }],

	/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Date: FIXED ENDS XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */
    '1ColDate':[{
      "datatype":   Constants.DATATYPE.TIME,
      "concept":    'dateCol',
      "minValue":   new Date( 2010, 1, 1 ),
      "maxValue":   new Date( 2010, 1, 11 ),
      "isMeas":     false,
      "colEnums":   null,
      "order":      0
    }],
    '1ColDate_partA':[{
      "datatype":   Constants.DATATYPE.TIME,
      "concept":    'dateCol',
      "minValue":   new Date( 2010, 1, 1 ),
      "maxValue":   new Date( 2010, 1, 6 ),
      "isMeas":     false,
      "colEnums":   null,
      "order":      0
    }],
    '1ColDate_partB':[{
      "datatype":   Constants.DATATYPE.TIME,
      "concept":    'dateCol',
      "minValue":   new Date( 2010, 1, 6 ),
      "maxValue":   new Date( 2010, 1, 11 ),
      "isMeas":     false,
      "colEnums":   null,
      "order":      0
    }],

	/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Enumerations: FIXED VALUES XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    '1ColEnum':[{
      "datatype":   Constants.DATATYPE.SEMANTIC,
      "concept":    'enumCol',
      "minValue":   null,
      "maxValue":   null,
      "isMeas":     false,
      "colEnums":   [ 'A', 'B', 'C', 'D' ],
      "totalEnumCount": 4,
      "order":      0
    }],
    '1ColEnum_partA':[{
      "datatype":   Constants.DATATYPE.SEMANTIC,
      "concept":    'enumCol',
      "minValue":   null,
      "maxValue":   null,
      "isMeas":     false,
      "colEnums":   [ 'C', 'D' ],
      "totalEnumCount": 2,
      "order":      0
    }],
    '1ColEnum_partB':[{
      "datatype":   Constants.DATATYPE.SEMANTIC,
      "concept":    'enumCol',
      "minValue":   null,
      "maxValue":   null,
      "isMeas":     false,
      "colEnums":   [ 'A', 'B' ],
      "totalEnumCount": 4,
      "order":      0
    }],

	/* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX MULTI COLUMN XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    '2ColMixed':[{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'numericCol',
      "minValue":   0,
      "maxValue":   10,
      "isMeas":     true,
      "colEnums":   null,
      "order":      0
    },{
      "datatype":   Constants.DATATYPE.SEMANTIC,
      "concept":    'enumCol',
      "minValue":   null,
      "maxValue":   null,
      "isMeas":     true,
      "colEnums":   [ 'A', 'B', 'C', 'D' ],
      "totalEnumCount": 10,
      "order":      1
    }],

    '2ColMixed_NumericDim':[{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'numericCol',
      "minValue":   0,
      "maxValue":   10,
      "isMeas":     false,
      "colEnums":   null,
      "order":      0
    },{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'measCol',
      "minValue":   0,
      "maxValue":   10,
      "isMeas":     true,
      "colEnums":   null,
      "order":      0
    }],

    '2ColMixed_EnumDim':[{
      "datatype":   Constants.DATATYPE.SEMANTIC,
      "concept":    'enumCol',
      "minValue":   null,
      "maxValue":   null,
      "isMeas":     false,
      "colEnums":   [ 'A', 'B', 'C', 'D' ],
      "totalEnumCount": 10,
      "order":      1
    },{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'measCol',
      "minValue":   0,
      "maxValue":   10,
      "isMeas":     true,
      "colEnums":   null,
      "order":      0
    }],

    '4ColMixed':[{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'numericCol',
      "minValue":   0,
      "maxValue":   10,
      "isMeas":     true,
      "colEnums":   null,
      "order":      0
    },{
      "datatype":   Constants.DATATYPE.SEMANTIC,
      "concept":    'enumCol',
      "minValue":   null,
      "maxValue":   null,
      "isMeas":     true,
      "colEnums":   [ 'A', 'B', 'C', 'D' ],
      "totalEnumCount": 10,
      "order":      1
    },{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'measCol',
      "minValue":   0,
      "maxValue":   10,
      "isMeas":     true,
      "colEnums":   null,
      "order":      0
    },{
      "datatype":   Constants.DATATYPE.NUMERIC,
      "concept":    'measCol2',
      "minValue":   0,
      "maxValue":   10,
      "isMeas":     true,
      "colEnums":   null,
      "order":      0
    }],

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Numeric: measurement-bound XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    '1ColNumeric_0to10m':[{
      "datatype":   Constants.DATATYPE.NUMERIC,
       "concept":    'numericCol',
       "minValue":   0,
       "maxValue":   10,
       "isMeas":     true,
       "colEnums":   null,
       "order":      0
    }],

  };
});