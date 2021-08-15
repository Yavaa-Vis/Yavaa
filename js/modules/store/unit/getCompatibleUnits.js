/**
 * find units compatible to the given one
 * compatible means, there is a conversion path between both
 */
"use strict";
define( [  'basic/types/Unit',
           'util/flatten.sparql',
           'text!template/query/unit/getConvGraphByCentroid.rq',
           'text!template/query/unit/getConvGraphCentroidByUnit.rq',
           'text!template/query/unit/convertUnits.rq',
           'text!template/query/unit/getSystemByUnit.rq',
 ], function(
           Unit,
           flatten,
           queryGetUnits,
           queryGetCentroid,
           queryConvertUnits,
           queryGetSystemByUnit
){

  /**
   * find all compatible units for the given one
   * @param   {Unit}      start    the unit alternatives are searched for
   * @returns {Array[Unit]}
   */
  return async function getCompatibleUnits( start ) {

    // make sure units are units
    if( !(start instanceof Unit) ){
      throw new Error( 'Parameter for getCompatibleUnits is not a unit!' );
    }


    // get the centroid for the respective conversion graph
    let res = await this._client.query( queryGetCentroid, {
                      'units': { 'value': start.getURI(), 'type': 'uri' }
                    });
    const centroidUri = flatten( res )[0].centroid; // there should only be one row here

    // find all compatible units
    res = await this._client.query( queryGetUnits,{
                  'centroid': { 'value': centroidUri, 'type': 'uri' }
                });
    const unitUris = flatten( res ).map( (entry) => entry.unit ),
          unitVals = unitUris.map( (uri) => { return {value: uri, type: 'uri' }; } )

    // get data for conversion graph
    res = await this._client.query( queryConvertUnits, {
                  'units': unitVals
                });
    const convData = flatten( res ),
          sortedConvData = sortByConvFactor( convData, centroidUri );

    // get systems for all units
    res = await this._client.query( queryGetSystemByUnit,{
                  'units': unitVals
                });
    const systems = flatten( res );

    // aggregate systems
    const sysLookup = {};
    systems.forEach( (entry) => {

      // make sure there is an entry
      sysLookup[ entry.system ] = sysLookup[ entry.system ] || {
                                                                  uri: entry.system,
                                                                  label: entry.systemLabel,
                                                                  units: []
                                                               };

      // add current unit
      sysLookup[ entry.system ].units.push( sortedConvData.indexOf( entry.unit ) );

    });

    // populate all units, so we have a label etc
    const units = sortedConvData.map( (uri) => this.getUnit( uri ) );
    await this.populateUnits( units );

    // collect result
    const result = {
        units:    units,
        systems:  Object.keys( sysLookup ).map( (key) => sysLookup[ key ] ),
    };

    // we are done
    return result;

  }


  /**
   * sort the given units by their conversion factor with respect to the centroid
   * sort order is descending
   * @param   {Array}           conversion data
   * @param   {String}          the URI of the centroid
   * @returns {Array[String]}   sorted list of unit URIs
   */
  function sortByConvFactor( data, centroid ) {

    // build reverse lookup
    const lookup = {};
    for( let i=0; i<data.length; i++ ) {

      // the centroid itself
      if( data.unit == centroid ) {
        continue;
      }

      if( data[i].prefixFactor != 1 ) {
        // non-prefix conversion
        lookup[ data[i].prefixBase ] = lookup[ data[i].prefixBase ] || {};
        lookup[ data[i].prefixBase ][ data[i].unit ] = parseFloat( data[i].prefixFactor );

      } else {
        // prefix conversion
        lookup[ data[i].convBase ] = lookup[ data[i].convBase ] || {};
        lookup[ data[i].convBase ][ data[i].unit ] = parseFloat( data[i].convFactor );
      }
    }

    // compute approx. conversion factor wrt. to centroid
    contractConvLookup( lookup, centroid );

    // prepare final result; sorting is descending
    const all = lookup[ centroid ];
    return Object.keys( all )
                 .sort( (a,b) => {
                   return all[ b ] - all[ a ];
                 });

  }


  /**
   * one recursion step to reduce the lookup to a single key
   * will collect all childrens' children in the current node
   */
  function contractConvLookup( lookup, key ) {

    // if there is no subgraph starting here, we are done
    if( !(key in lookup) ) {
      return;
    }

    // recursive walk for all child nodes
    Object.keys( lookup[ key ] )
          .filter( (subKey) => subKey != key )    // prevent endless loop as a result of self reference
          .forEach( (subKey) => contractConvLookup( lookup, subKey ) );

    // collect childs' children
    Object.keys( lookup[ key ] )
          .filter( (subKey) => subKey != key )    // prevent endless loop as a result of self reference
          .forEach( (subKey) => {

            // only those, with children themselves
            if( !(subKey in lookup) ) {
              return;
            }

            // copy child's children over
            Object.keys( lookup[ subKey ] )
                  .forEach( (subSubKey) => {
                    lookup[ key ][ subSubKey ] = lookup[ subKey ][ subSubKey ] * lookup[ key ][ subKey ];
                  });

            // remove child
            delete lookup[ subKey ];

          });


  }

});