"use strict";
/**
 * part of store/unit.sparql
 *
 * attaches the compounds to the given units
 * will make recursive calls, if needed
 *
 */
define( [ 'basic/types/ArbNumber',
          'util/flatten.sparql',
          'store/unit/replaceCompounds',
          'text!template/query/unit/decomposeUnits.rq'
], function(
          ArbNumber,
          flattenResult,
          replaceCompounds,
          queryDecompose
){

  // some flags we might need
  const sym = {
      'inited':   Symbol( 'Unit compounds have been completely resolved' ),
      'base':     Symbol( 'Unit is a base unit, which can not be further decomposed' ),
      'resolved': Symbol( 'A query already run for this unit' ),
      'query':    Symbol( 'Query, that is populating a unit' ),
  };

  // prefixes will appear over and over again: no need to parse them each time to ArbNumber
  const prefixCache = {
      '1': new ArbNumber( '1' )
  };

  /**
   * resolve the given list of units
   */
  async function populateCompounds( units ) {

    // make sure there is something to work with
    if( !units ) {
      throw new Error( 'Empty input given in populateCompounds()!' );
    }

    // make sure, we are working with an array here
    if( !(units instanceof Array) ) {
      units = [ units ];
    }

    // make unit list unique
    const uniqueUnits = [ ... new Set( units ) ];

    // filter for those, that actually need to be processed
    // == those not already expanded
    const unresolvedUnits = uniqueUnits.filter( (unit) => !('_compounds' in unit) );

    // init resolver
    const resolver = new Resolver( this );

    // collect dependencies, if existing
    // == compounds that themselves could still be resolved
    // mostly relevant for populating resolvedUnits as they already contain compounds, that are not necessarily decomposed
    uniqueUnits.filter( (unit) => ('_compounds' in unit) )
                .forEach( (unit) => {
                  for( const compound of [ ... unit._compounds.num, ... unit._compounds.denom ] ) {
                    if(     !( '_compounds' in compound )            // not inited itself
                        ||  (compound._compounds.denom.length > 0)
                        ||  (compound._compounds.num.length > 1)     // not a base unit
                      ) {
                      resolver.addDependency( compound, unit );
                    }
                  }
                });

    // shortcut, if there is nothing to do
    if( (unresolvedUnits.length < 1)
        && !resolver.hasOpenDependencies() ){
      return Promise.resolve( uniqueUnits );
    }

    // units to augment are only those, for which no other query is running yet
    const unitsToAugment = unresolvedUnits.filter( (u) => !(sym.query in u) ),
          queriesRunning = unresolvedUnits.filter( (u) => (sym.query in u ) )
                                          .map( (u) => u[ sym.query ] );

    // trigger processing of unresolved units
    const query = resolver.doDecomp( unitsToAugment );

    // set this query as the processor for all units to be augmented
    unitsToAugment.forEach( (u) => u[ sym.query ] = query );

    // wait until all queries are finished
    await Promise.all( [ query, ... new Set( queriesRunning ) ] );

    // make sure all units are in their simplified state
    for( const unit of unitsToAugment ) {
      unit._simplifyCompoundVector();
    }

    // remove query marker
    for( const unit of unitsToAugment ) {
      delete unit[ sym.query ];
    }

    // return the requested units
    return uniqueUnits;

  }


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Resolver XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  function Resolver( store ) {

    // keep a link to the SPARQL client
    this._store = store;

    // init dependency map
    this._deps = new Map();

  }


  /**
   * add a further entry to the list of dependencies
   * unit is dependent on dep
   */
  Resolver.prototype.addDependency = function addDependency( dep, unit ) {

    // do we need to resolve the dependency further?
    if( !( sym.inited in dep ) ) {

      // get list of dependent units so far, if it exists
      var depUnits = this._deps.get( dep );

      // make sure it exists
      if( !depUnits ) {

        // create new
        depUnits = new Set();

        // update dependency list
        this._deps.set( dep, depUnits );

      }

      // add the current unit as dependent
      depUnits.add( unit );

    }

  }

  /**
   * are there still unresolved dependencies to be processed?
   */
  Resolver.prototype.hasOpenDependencies = function hasOpenDependencies(){
    return this._deps.size > 0;
  }


  /**
   * make one call to the backend for decomposition
   * if all units have been decomposed, resolve the result
   *
   * @param   {Array}       units
   * @returns {Promise}
   */
  Resolver.prototype.doDecomp = function doDecomp( units ){

    // convert units to the correct input format
    const param = units.map( ( unit ) => {

                          // mark, that we already ran a query for this unit
                          unit[ sym.resolved ] = true;

                          // format respective parameter
                          return {
                            'value': unit.getURI(),
                            'type':  'uri'
                          };

                        });

    // issue query
    return this._store._client
          .query( queryDecompose, { 'units': param } )
          .then( ( queryRes ) => {

            /* -------------- Phase 1: process query results --------------- */

            // flatten the result
            const data = flattenResult( queryRes );

            // create a map for the compounds
            const compoundMap = {};
            for( let i=0; i<data.length; i++ ) {

              // make sure the compounds property is initialized
              if( !( data[i].unit in compoundMap ) ) {
                compoundMap[ data[i].unit ] = {
                    'num':           [],
                    'denom':         [],
                    'prefixFactor':  prefixCache['1'],
                };
              }
              const compounds = compoundMap[ data[i].unit ],
                    unit      = this._store.getUnit( data[i].unit );

              switch( true ) {

                // found a prefixed unit
                case ('prefixBase' in data[i]):

                  // get the dependency
                  var dep = this._store.getUnit( data[i].prefixBase );

                  // get the ArbNumber instance for the factor
                  if( !(data[i].prefixFactor in prefixCache) ) {
                    prefixCache[ data[i].prefixFactor ] = new ArbNumber( data[i].prefixFactor );
                  }
                  var factor = prefixCache[ data[i].prefixFactor ];

                  // set prefixFactor and base
                  compounds.prefixFactor = factor;
                  compounds.num.push( dep );

                  // deal with dependencies
                  this.addDependency( dep, unit );
                  break;

                // found a definition
                case ('def' in data[i]):

                  // is the definition a unit itself or just a description
                  if( data[i].defIsUnit ) {

                    // found a dependency

                    // get a link to the unit depended upon
                    var dep = this._store.getUnit( data[i].def );

                    // add to unit
                    compounds.num.push( dep );

                    // deal with dependencies
                    this.addDependency( dep, unit );

                  } else {

                    // definition is just a description, so this unit has been resolved
                    unit[ sym.inited ] = true;
                    unit[ sym.base ]   = true;

                    // it is its only compound
                    compounds.num.push( unit );

                  }
                  break;

                // unit is the exponent of another unit
                case ('baseUnit' in data[i]):

                  // get the dependency
                  var dep = this._store.getUnit( data[i].baseUnit );

                  // determine which ator to push to
                  var ator;
                  if( data[i].baseExponent > 0 ) {
                    // for positive exponents push to numerator
                    ator = compounds.num;
                  } else {
                    // for negative exponents push to denominator
                    ator = compounds.denom;
                    data[i].baseExponent = Math.abs( data[i].baseExponent );
                  }

                  // add respective amount to numerator
                  for( let j=0; j<data[i].baseExponent; j++ ) {
                    ator.push( dep );
                  }

                  // deal with further dependencies
                  this.addDependency( dep, unit );

                  break;

                // other compounds are given
                case ('atorProp' in data[i]):

                  // get a link to the unit depended upon
                  var dep = this._store.getUnit( data[i].component );

                  // add to compounds
                  if( data[i].atorProp == 'http://www.wurvoc.org/vocabularies/om-1.8/denominator' ) {
                    compounds.denom.push( dep );
                  } else {
                    compounds.num.push( dep );
                  }

                  // deal with further dependencies
                  this.addDependency( dep, unit );

                  break;

                // this should not happen
                default:

                  // no decomposition found, so we assume this is a base unit
                  unit[ sym.inited ] = true;
                  unit[ sym.base ]   = true;

                  // it is its only compound
                  compounds.num.push( unit );

              }

            }

            // set the compounds (atomic, so that concurrent requests will not result in invalid state)
            Object.keys( compoundMap )
                  .forEach( (uri) => {

                    // get the unit that is affected by this entry
                    const unit = this._store.getUnit( uri );

                    // set the compounds
                    if( !('_compounds' in unit ) ) {
                      unit._setVal( '_compounds', compoundMap[ uri ] );
                    }

                  });


            /* ------------- Phase 2: check for finished units ------------- */

            // get uninitialized units with dependencies
            let unresolved = [ ... this._deps.keys() ];

            for( const unit of unresolved ) {
              if( isUnitInited( unit ) ) {

                // we could finally resolve something, so clear its dependencies
                this.resolveDeps( unit );

              }
            }

            /* --------------- Phase 3: recursively keep on  --------------- */

            // get the list of still unresolved units, which we not yet ran a query for
            unresolved = unresolved.filter( el => !(sym.resolved in el));

            if( unresolved.length > 0 ) {
              return this.doDecomp( unresolved );
            } else {
              return Promise.resolve( true );
            }

          });

  };


  /**
   * resolve all units, that are dependent on dep
   * @param {Unit}   dep    the dependency
   * @param {Unit*}  unit   the unit in which to replace the dependency
   */
  Resolver.prototype.resolveDeps = function resolveDeps( dep, unit ) {

    // don't do anything, if the dependency has not yet been initialized
    if( !(sym.inited in dep) ) {
      return;
    }

    // get dependent units
    let units;
    if( unit ) {
      units = [ unit ];
    } else {
      units = this._deps.get( dep );
      this._deps.delete( dep );
    }

    if( !units ) {
      return;
    }

    // the dependency is not a real one
    if( sym.base in dep ) {
      return;
    }

    // make sure units is an array
    units = [ ... units ];

    // process all dependent units
    for( const u of units ) {

      // replace the compounds
      replaceCompounds( u, dep );

      // if this unit now is initialized as well, call recursively
      if( isUnitInited( u ) ) {
        this.resolveDeps( u );
      }

    }

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Helper XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * checks, if a unit is completely (recursively) initialized
   * a unit is finished, if any of the following holds true
   * - the sym.inited flag is set
   * - all compounds have the sym.inited flag set
   */
  function isUnitInited( unit ) {

    // flag has been set
    if( sym.inited in unit ) {
      return true;
    }

    // not even a compound property has been set
    if( !('_compounds' in unit ) ) {
      return false;
    }

    // check compounds
    for( const c of unit._compounds.num ) {
      if( !( sym.base in c ) ) {
        return false;
      }
    }
    for( const c of unit._compounds.denom ) {
      if( !( sym.base in c ) ) {
        return false;
      }
    }

    // if we came this far, the unit is initialized
    unit[ sym.inited ] = true;
    unit._simplifyCompoundVector();
    return true;

  }

  return populateCompounds;

});