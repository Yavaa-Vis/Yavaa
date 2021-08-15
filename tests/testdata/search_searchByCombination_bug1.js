/**
 * test inputs for search by combination tests
 * * test derived from an actual bug
 */
define({

  query: [
    {
      "datatype": "codelist",
      "concept": "http://eurostat.linked-statistics.org/dic/sex",
      "colEnums": [
        "http://eurostat.linked-statistics.org/dic/sex#F"
      ],
      "minValue": null,
      "maxValue": null
    },
    {
      "datatype": "codelist",
      "concept": "http://eurostat.linked-statistics.org/dic/geo",
      "colEnums": [
        "http://eurostat.linked-statistics.org/dic/geo#FR"
      ]
    },
    {
      "datatype": "time",
      "concept": "http://eurostat.linked-statistics.org/dic/time"
    },
    {
      "datatype": "numeric",
      "concept": "http://yavaa.org/ns/eurostat/meas/harmonisedUnemployment"
    }
  ],

  // totalDimCount
  totalDimCount: 5,

  // covers
  covers: [
    {
      "concept": "http://eurostat.linked-statistics.org/dic/sex",
      "colEnums": [
        "http://eurostat.linked-statistics.org/dic/sex#F",
        "http://eurostat.linked-statistics.org/dic/sex#M",
        "http://eurostat.linked-statistics.org/dic/sex#T"
      ],
      "totalEnumCount": 3,
      "minValue": null,
      "maxValue": null,
      "isMeas": false,
      "order": 3
    },
    {
      "concept": "http://eurostat.linked-statistics.org/dic/geo",
      "colEnums": [
        "http://eurostat.linked-statistics.org/dic/geo#AT",
        "http://eurostat.linked-statistics.org/dic/geo#BG",
        "http://eurostat.linked-statistics.org/dic/geo#CY",
        "http://eurostat.linked-statistics.org/dic/geo#CZ",
        "http://eurostat.linked-statistics.org/dic/geo#DE",
        "http://eurostat.linked-statistics.org/dic/geo#ES",
        "http://eurostat.linked-statistics.org/dic/geo#FI",
        "http://eurostat.linked-statistics.org/dic/geo#FR",
        "http://eurostat.linked-statistics.org/dic/geo#HR",
        "http://eurostat.linked-statistics.org/dic/geo#IT",
        "http://eurostat.linked-statistics.org/dic/geo#LT",
        "http://eurostat.linked-statistics.org/dic/geo#LV",
        "http://eurostat.linked-statistics.org/dic/geo#NO",
        "http://eurostat.linked-statistics.org/dic/geo#PL",
        "http://eurostat.linked-statistics.org/dic/geo#RO",
        "http://eurostat.linked-statistics.org/dic/geo#SE",
        "http://eurostat.linked-statistics.org/dic/geo#SI",
        "http://eurostat.linked-statistics.org/dic/geo#SK",
        "http://eurostat.linked-statistics.org/dic/geo#TR",
        "http://eurostat.linked-statistics.org/dic/geo#BE",
        "http://eurostat.linked-statistics.org/dic/geo#EE",
        "http://eurostat.linked-statistics.org/dic/geo#HU",
        "http://eurostat.linked-statistics.org/dic/geo#MT",
        "http://eurostat.linked-statistics.org/dic/geo#IE",
        "http://eurostat.linked-statistics.org/dic/geo#NL",
        "http://eurostat.linked-statistics.org/dic/geo#UK",
        "http://eurostat.linked-statistics.org/dic/geo#IS",
        "http://eurostat.linked-statistics.org/dic/geo#LU",
        "http://eurostat.linked-statistics.org/dic/geo#PT",
        "http://eurostat.linked-statistics.org/dic/geo#DK",
        "http://eurostat.linked-statistics.org/dic/geo#EA",
        "http://eurostat.linked-statistics.org/dic/geo#EL",
        "http://eurostat.linked-statistics.org/dic/geo#EU27",
        "http://eurostat.linked-statistics.org/dic/geo#EU28",
        "http://eurostat.linked-statistics.org/dic/geo#EA19",
        "http://eurostat.linked-statistics.org/dic/geo#EA18",
        "http://eurostat.linked-statistics.org/dic/geo#US"
      ],
      "totalEnumCount": 37,
      "minValue": null,
      "maxValue": null,
      "isMeas": false,
      "order": 5
    },
    {
      "concept": "http://eurostat.linked-statistics.org/dic/time",
      "colEnums": null,
      "totalEnumCount": null,
      "minValue": new Date( "2016-04-01T00:00:01.000Z" ),
      "maxValue": new Date( "2017-03-01T00:00:01.000Z" ),
      "isMeas": false,
      "order": 6
    },
    {
      "concept": "http://yavaa.org/ns/eurostat/meas/harmonisedUnemployment",
      "colEnums": null,
      "totalEnumCount": null,
      "minValue": 1,
      "maxValue": 4330,
      "isMeas": true,
      "order": 7
    }
  ],

  // filter / overlap
  filter: [
    {
      "values": [
        "http://eurostat.linked-statistics.org/dic/sex#F"
      ],
      "order": 3,
      "effective": false
    },
    {
      "values": [
        "http://eurostat.linked-statistics.org/dic/geo#FR"
      ],
      "order": 5,
      "effective": false
    },
    {
      "minValue": new Date( "2016-04-01T00:00:01.000Z" ),
      "maxValue": new Date( "2017-03-01T00:00:01.000Z" ),
      "order": 6,
      "effective": false
    },
    {
      "minValue": 1,
      "maxValue": 4330,
      "order": 7,
      "effective": false
    }
  ]

});