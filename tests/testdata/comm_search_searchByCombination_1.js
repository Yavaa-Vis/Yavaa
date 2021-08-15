"use strict";
/**
 * test data for a integration test of search/searchByCombination
 *
 * contains:
 * - (query)    query passed to the component
 * - (cand)     mocked results for store.meta.searchDatasetByConstraint()
 * - (metadata) mocked results for store.meta.getMetadata()
 * - (columns)  mocked results for store.meta.getColumns()
 * - (result)   expected results after combination
 *
 */
define([], {
  
  label: 'real-world query; restriction on time column',
  
  /* (query) */
  query: [
      {
        "datatype": "semantic",
        "concept": "http://eurostat.linked-statistics.org/dic/geo",
        "colEnums": ["http://eurostat.linked-statistics.org/dic/geo#DE", "http://eurostat.linked-statistics.org/dic/geo#FR", "http://eurostat.linked-statistics.org/dic/geo#UK"],
        "minValue": null,
        "maxValue": null
      }, {
        "datatype": "time",
        "concept": "http://eurostat.linked-statistics.org/dic/time",
        "colEnums": null,
        "minValue": 1277071260000,
        "maxValue": 1372024860000
      }, {
        "datatype": "numeric",
        "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningEnglish",
        "colEnums": null
      }, {
        "datatype": "numeric",
        "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningFrench",
        "colEnums": null
      }, {
        "datatype": "numeric",
        "concept": "http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman",
        "colEnums": null
      }
    ],

  /* cand */
  cand: [{"ds":"http://yavaa.org/ns/eurostat/dsd#tps00059","covers":[{"concept":"http://eurostat.linked-statistics.org/dic/geo","colEnums":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"totalEnumCount":34,"minValue":null,"maxValue":null,"isMeas":false,"order":2, "datatype": "semantic"},{"concept":"http://eurostat.linked-statistics.org/dic/time","colEnums":null,"totalEnumCount":null,"minValue": new Date("2004-01-01T00:00:01.000Z"),"maxValue": new Date("2012-01-01T00:00:01.000Z"),"isMeas":false,"order":3, "datatype": "time"},{"concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman","colEnums":null,"totalEnumCount":null,"minValue":0,"maxValue":100,"isMeas":true,"order":4}],"totalDimCount":3,"measureCount":1, "datatype": "numeric"},{"ds":"http://yavaa.org/ns/eurostat/dsd#tps00057","covers":[{"concept":"http://eurostat.linked-statistics.org/dic/geo","colEnums":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"totalEnumCount":34,"minValue":null,"maxValue":null,"isMeas":false,"order":2, "datatype": "semantic"},{"concept":"http://eurostat.linked-statistics.org/dic/time","colEnums":null,"totalEnumCount":null,"minValue": new Date("2003-01-01T00:00:01.000Z"),"maxValue": new Date("2012-01-01T00:00:01.000Z"),"isMeas":false,"order":3, "datatype": "time"},{"concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningEnglish","colEnums":null,"totalEnumCount":null,"minValue":36.2,"maxValue":100,"isMeas":true,"order":4, "datatype": "numeric"}],"totalDimCount":3,"measureCount":1},{"ds":"http://yavaa.org/ns/eurostat/dsd#tps00058","covers":[{"concept":"http://eurostat.linked-statistics.org/dic/geo","colEnums":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"totalEnumCount":34,"minValue":null,"maxValue":null,"isMeas":false,"order":2, "datatype": "semantic"},{"concept":"http://eurostat.linked-statistics.org/dic/time","colEnums":null,"totalEnumCount":null,"minValue": new Date("2003-01-01T00:00:01.000Z"),"maxValue": new Date("2012-01-01T00:00:01.000Z"),"isMeas":false,"order":3, "datatype": "time"},{"concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningFrench","colEnums":null,"totalEnumCount":null,"minValue":0.3,"maxValue":100,"isMeas":true,"order":4, "datatype": "numeric"}],"totalDimCount":3,"measureCount":1}],

  /* metadata */
  metadata: {"http://yavaa.org/ns/eurostat/dsd#tps00059":{"http://purl.org/dc/terms/title":["Pupils learning German"],"http://purl.org/linked-data/cube#structure":["http://yavaa.org/ns/eurostat/dsd#tps00059_dsd"],"http://purl.org/dc/terms/publisher":["http://yavaa.org/ns/Eurostat"],"http://www.w3.org/ns/dcat#distribution":["http://yavaa.org/ns/eurostat/dsd#tps00059_dist_tsv","http://yavaa.org/ns/eurostat/dsd#tps00059_dist_sdmx"]},"http://yavaa.org/ns/eurostat/dsd#tps00057":{"http://purl.org/dc/terms/title":["Pupils learning English"],"http://purl.org/linked-data/cube#structure":["http://yavaa.org/ns/eurostat/dsd#tps00057_dsd"],"http://purl.org/dc/terms/publisher":["http://yavaa.org/ns/Eurostat"],"http://www.w3.org/ns/dcat#distribution":["http://yavaa.org/ns/eurostat/dsd#tps00057_dist_tsv","http://yavaa.org/ns/eurostat/dsd#tps00057_dist_sdmx"]},"http://yavaa.org/ns/eurostat/dsd#tps00058":{"http://purl.org/dc/terms/title":["Pupils learning French"],"http://purl.org/linked-data/cube#structure":["http://yavaa.org/ns/eurostat/dsd#tps00058_dsd"],"http://purl.org/dc/terms/publisher":["http://yavaa.org/ns/Eurostat"],"http://www.w3.org/ns/dcat#distribution":["http://yavaa.org/ns/eurostat/dsd#tps00058_dist_tsv","http://yavaa.org/ns/eurostat/dsd#tps00058_dist_sdmx"]}},

  /* columndata */
  columns: {"http://yavaa.org/ns/eurostat/dsd#tps00059":[,{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#indic_ed_28","concept":"http://eurostat.linked-statistics.org/dic/indic_ed","label":"Education indicator","order":1,"datatype":"semantic"},{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#geo_3632","concept":"http://eurostat.linked-statistics.org/dic/geo","label":"Geopolitical entity (reporting)","order":2,"datatype":"semantic"},{"role":"http://purl.org/linked-data/cube#dimension","concept":"http://eurostat.linked-statistics.org/dic/time","label":"Time","time":"http://yavaa.org/ns/yavaa#instant-YYYY","order":3,"datatype":"time"},{"role":"http://purl.org/linked-data/cube#measure","concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman","numeric":"numeric","label":"Pupils learning German","order":4,"datatype":"numeric"}],"http://yavaa.org/ns/eurostat/dsd#tps00057":[,{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#indic_ed_26","concept":"http://eurostat.linked-statistics.org/dic/indic_ed","label":"Education indicator","order":1,"datatype":"semantic"},{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#geo_3632","concept":"http://eurostat.linked-statistics.org/dic/geo","label":"Geopolitical entity (reporting)","order":2,"datatype":"semantic"},{"role":"http://purl.org/linked-data/cube#dimension","concept":"http://eurostat.linked-statistics.org/dic/time","label":"Time","time":"http://yavaa.org/ns/yavaa#instant-YYYY","order":3,"datatype":"time"},{"role":"http://purl.org/linked-data/cube#measure","concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningEnglish","numeric":"numeric","label":"Pupils learning English","order":4,"datatype":"numeric"}],"http://yavaa.org/ns/eurostat/dsd#tps00058":[,{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#indic_ed_27","concept":"http://eurostat.linked-statistics.org/dic/indic_ed","label":"Education indicator","order":1,"datatype":"semantic"},{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#geo_3632","concept":"http://eurostat.linked-statistics.org/dic/geo","label":"Geopolitical entity (reporting)","order":2,"datatype":"semantic"},{"role":"http://purl.org/linked-data/cube#dimension","concept":"http://eurostat.linked-statistics.org/dic/time","label":"Time","time":"http://yavaa.org/ns/yavaa#instant-YYYY","order":3,"datatype":"time"},{"role":"http://purl.org/linked-data/cube#measure","concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningFrench","numeric":"numeric","label":"Pupils learning French","order":4,"datatype":"numeric"}]},

  /* overall result */
  result: {"pwf":{"op1":2,"op2":{"op1":0,"op2":1,"op":"J","cond":[[0,0],[1,1]]},"op":"J","cond":[[0,0],[1,1]]},"components":[{"ds":"http://yavaa.org/ns/eurostat/dsd#tps00059","dsPublisher":"http://yavaa.org/ns/Eurostat","filter":{"2":{"values":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"order":2,"effective":true},"3":{"minValue": new Date("2010-06-20T22:01:00.000Z"),"maxValue": new Date("2012-01-01T00:00:01.000Z"),"order":3,"effective":true}},"columns":[,{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#indic_ed_28","concept":"http://eurostat.linked-statistics.org/dic/indic_ed","label":"Education indicator","order":1,"datatype":"semantic"},{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#geo_3632","concept":"http://eurostat.linked-statistics.org/dic/geo","label":"Geopolitical entity (reporting)","order":2,"datatype":"semantic","usedRange":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"coverage":1},{"role":"http://purl.org/linked-data/cube#dimension","concept":"http://eurostat.linked-statistics.org/dic/time","label":"Time","time":"http://yavaa.org/ns/yavaa#instant-YYYY","order":3,"datatype":"time","usedRange":{"minValue": new Date("2010-06-20T22:01:00.000Z"),"maxValue": new Date("2012-01-01T00:00:01.000Z")},"coverage":1},{"role":"http://purl.org/linked-data/cube#measure","concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman","numeric":"numeric","label":"Pupils learning German","order":4,"datatype":"numeric","usedRange":{"minValue":0,"maxValue":100},"coverage":1}],"aggColumns":[1],"resultOrder":{"2":0,"3":1,"4":4},"coverage":0.6},{"ds":"http://yavaa.org/ns/eurostat/dsd#tps00057","dsPublisher":"http://yavaa.org/ns/Eurostat","filter":{"2":{"values":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"order":2,"effective":true},"3":{"minValue": new Date("2010-06-20T22:01:00.000Z"),"maxValue": new Date("2012-01-01T00:00:01.000Z"),"order":3,"effective":true}},"columns":[,{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#indic_ed_26","concept":"http://eurostat.linked-statistics.org/dic/indic_ed","label":"Education indicator","order":1,"datatype":"semantic"},{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#geo_3632","concept":"http://eurostat.linked-statistics.org/dic/geo","label":"Geopolitical entity (reporting)","order":2,"datatype":"semantic","usedRange":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"coverage":1},{"role":"http://purl.org/linked-data/cube#dimension","concept":"http://eurostat.linked-statistics.org/dic/time","label":"Time","time":"http://yavaa.org/ns/yavaa#instant-YYYY","order":3,"datatype":"time","usedRange":{"minValue": new Date("2010-06-20T22:01:00.000Z"),"maxValue": new Date("2012-01-01T00:00:01.000Z")},"coverage":1},{"role":"http://purl.org/linked-data/cube#measure","concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningEnglish","numeric":"numeric","label":"Pupils learning English","order":4,"datatype":"numeric","usedRange":{"minValue":36.2,"maxValue":100},"coverage":1}],"aggColumns":[1],"resultOrder":{"2":0,"3":1,"4":2},"coverage":0.6},{"ds":"http://yavaa.org/ns/eurostat/dsd#tps00058","dsPublisher":"http://yavaa.org/ns/Eurostat","filter":{"2":{"values":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"order":2,"effective":true},"3":{"minValue": new Date("2010-06-20T22:01:00.000Z"),"maxValue":new Date("2012-01-01T00:00:01.000Z"),"order":3,"effective":true}},"columns":[,{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#indic_ed_27","concept":"http://eurostat.linked-statistics.org/dic/indic_ed","label":"Education indicator","order":1,"datatype":"semantic"},{"coded":"http://purl.org/linked-data/cube#CodedProperty","role":"http://purl.org/linked-data/cube#dimension","codelist":"http://yavaa.org/ns/cl/eurostat#geo_3632","concept":"http://eurostat.linked-statistics.org/dic/geo","label":"Geopolitical entity (reporting)","order":2,"datatype":"semantic","usedRange":["http://eurostat.linked-statistics.org/dic/geo#DE","http://eurostat.linked-statistics.org/dic/geo#FR","http://eurostat.linked-statistics.org/dic/geo#UK"],"coverage":1},{"role":"http://purl.org/linked-data/cube#dimension","concept":"http://eurostat.linked-statistics.org/dic/time","label":"Time","time":"http://yavaa.org/ns/yavaa#instant-YYYY","order":3,"datatype":"time","usedRange":{"minValue": new Date("2010-06-20T22:01:00.000Z"),"maxValue":new Date("2012-01-01T00:00:01.000Z")},"coverage":1},{"role":"http://purl.org/linked-data/cube#measure","concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningFrench","numeric":"numeric","label":"Pupils learning French","order":4,"datatype":"numeric","usedRange":{"minValue":0.3,"maxValue":100},"coverage":1}],"aggColumns":[1],"resultOrder":{"2":0,"3":1,"4":3},"coverage":0.6}],"result":{"0":{"values":{},"concept":"http://eurostat.linked-statistics.org/dic/geo","datatype":"semantic"},"1":{"minValue":1277071260000,"maxValue":1325376001000,"concept":"http://eurostat.linked-statistics.org/dic/time","datatype":"time"},"2":{"minValue":36.2,"maxValue":100,"concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningEnglish","datatype":"numeric"},"3":{"minValue":0.3,"maxValue":100,"concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningFrench","datatype":"numeric"},"4":{"minValue":0,"maxValue":100,"concept":"http://yavaa.org/ns/eurostat/meas/pupilsLearningGerman","datatype":"numeric"}}},

});