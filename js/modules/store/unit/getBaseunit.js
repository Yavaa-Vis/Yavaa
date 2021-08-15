"use strict";
/**
 * for given units find a conversion path to the base unit of that dimension
 * and return list of factors along that path
 * not applicable to scaled units or VirtualUnit
 *
 * base unit array can contain multiple units in case of compound inputs
 * factors might not be sorted the same way as are the base components
 *
 * input
 * [ Unit ]
 *
 * returns
 * [
 *   {
 *     unit: <String>               // the unit in question
 *     base: [ <String> ]           // the respective base unit(s)
 *     factors: [ <ArbNumber> ]     // conversion factor path
 *   }
 *   , ...
 * ]
 */
define([
          'basic/types/ArbNumber',
          'util/flatten.sparql',
          'text!template/query/unit/getBaseunit_prefix.rq',
          'text!template/query/unit/getBaseunit.rq'
], function(
          ArbNumber,
          flattenResult,
          queryPrefixPath,
          queryPath
){

  return async function getBaseunit( units ) {

    // make sure we have an array for units
    if( !(units instanceof Array) ) {
      units = [ units ];
    }

    // make sure unit list is unique
    const uniqueUnits = new Set( units );

    // maintain lookups for ...
    const lookup = new Map();         // decomposition
    const involvedBases = new Set();  // involved base units

    // resolve compound units and add all compounds to the resolve-set
    await this.populateCompounds( [ ... uniqueUnits ] );
    uniqueUnits.forEach( (unit) => {

      // only for actual compound units
      if( unit._compounds.num[0] != unit ) {

        // add all compounds to resolve-set
        unit._compounds.num.forEach( (u) => uniqueUnits.add( u ) );
        unit._compounds.denom.forEach( (u) => uniqueUnits.add( u ) );

        // if this is an actual compound unit, add to lookup
        lookup.set( unit, {
          unit:     unit,
          factors:  {
            num:    [ unit._compounds.prefixFactor ],
            denom:  []
          },
          base:     {
            num:    [ ... unit._compounds.num ],
            denom:  [ ... unit._compounds.denom ],
          }
        });

      }

    });

    // resolve prefixed units
    let res = await this._client
                        .query( queryPrefixPath,{
                            'units': [ ... uniqueUnits ]
                                          .map( ( unit ) => {
                                            return { 'value': unit.getURI(), 'type': 'uri' }
                                          })
                        });
    const prefixPaths = flattenResult( res );

    // add list of base units to the request list
    prefixPaths.forEach( (entry) => uniqueUnits.add( this.getUnit( entry.base ) ) );

    // remove gram to prevent problems from the conversion cycle gram <-> kilogram in OM 1.8
    uniqueUnits.delete( this.getUnit( 'http://www.wurvoc.org/vocabularies/om-1.8/gram' ) );

    // get paths for non-prefixed units
    res = await this._client
                    .query( queryPath,{
                        'units': [ ... uniqueUnits ]
                                      .map( ( unit ) => {
                                        return { 'value': unit.getURI(), 'type': 'uri' }
                                      })
                    });
    const nonPrefixPaths = flattenResult( res );

    // create a lookups for all units and their paths
    prefixPaths.forEach( (entry) => {
      const source = this.getUnit( entry.source ),
            base   = this.getUnit( entry.base );
      involvedBases.add( base );
      lookup.set( source, {
          unit:     source,
          factors:  {
            num:    [ ArbNumber( entry.factor ) ],
            denom:  [],
          },
          base:     {
            num:    [ base ],
            denom:  [],
          }
      });
    });
    nonPrefixPaths.forEach( (entry) => {
      const source = this.getUnit( entry.source ),
            base   = this.getUnit( entry.base );
      involvedBases.add( base );
      lookup.set( source, {
          unit:     source,
          factors:  {
            num:    [ ArbNumber( entry.factor ) ],
            denom:  [],
          },
          base:     {
            num:    [ base ],
            denom:  [],
          }
      });
    });

    // add compound expansions to the lookup
    await this.populateCompounds( [ ... involvedBases ] );
    involvedBases.forEach( (source) => {
                    // only add actual compound units
                    if( source._compounds.num[ 0 ] != source ) {
                      lookup.set( source, {
                        unit:     source,
                        factors:  {           // left empty as the factor here should always be 1
                          num:    [],
                          denom:  [],
                        },
                        base:     {
                          num:    [ ... source._compounds.num ],
                          denom:  [ ... source._compounds.denom ],
                        }
                      });
                    }
                  });

    // remove all cycles from lookup
    // shouldn't actually happen
    for( const entry of lookup.values() ) {

      if( entry.base.num[ 0 ] == entry.unit ) {
        lookup.delete( entry.unit );
      }

    }

    // expand all paths up to the base
    for( const entry of lookup.values() ) {

      // keep on expanding, until we reach the actual base units
      let finished;
      do {

        // we assume this will be the last round
        finished = true;

        // collect base components
        const newBase   = { num: [], denom: [] };

        // expand numerator
        for( const base of entry.base.num ) {

          // not resolvable anymore
          if( !lookup.has( base ) ) {
            newBase.num.push( base );
            continue;
          }

          // one more resolving step
          const res = lookup.get( base );
          entry.factors.num.push( ... res.factors.num );
          entry.factors.denom.push( ... res.factors.denom );
          newBase.num.push( ... res.base.num );
          newBase.denom.push( ... res.base.denom );

          // we'll need to go another round
          finished = false;

        }

        // expand numerator
        for( const base of entry.base.denom ) {

          // not resolvable anymore
          if( !lookup.has( base ) ) {
            newBase.denom.push( base );
            continue;
          }

          // one more resolving step
          const res = lookup.get( base );
          entry.factors.denom.push( ... res.factors.num );
          entry.factors.num.push( ... res.factors.denom );
          newBase.denom.push( ... res.base.num );
          newBase.num.push( ... res.base.denom );

          // we'll need to go another round
          finished = false;

        }

        // done for this round
        entry.base = newBase;

      } while( !finished );

    }

    // remove all entries, that were not requested
    const result = [ ... lookup.values() ].filter( (u) => units.includes( u.unit ) );

    // units not (yet) part of the result are their own base unit
    units.filter( (u) => !lookup.has( u ) )
         .forEach( (u) => {
           result.push({
             unit:    u,
             factors: { num: [], denom: [] },
             base:    { num: [ u ], denom: [] },
           });
         });

    // we are done
    return result;

  }

});