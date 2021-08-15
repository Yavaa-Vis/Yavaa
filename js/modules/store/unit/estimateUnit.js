"use strict";
/**
 * estimate the resulting unit of a given formula
 *
 * formula is given as an AST as provided by comp/function/parseFormula
 *
 * node has the following properties upon input:
 * - value
 * - type
 * - *children
 *
 * newly attached
 * - sym.wrap    ... wrapper for this node of type store/Unit/AstNodeWrapper
 */
define([
        'store/unit',
        'store/unit/estimateUnit/VirtualUnit',
        'store/unit/estimateUnit/AstNodeWrapper',
        'store/unit/estimateUnit/rules/phase1',
        'store/unit/estimateUnit/rules/phase3'
       ],
function(
        UnitStore,
        VirtualUnit,
        NodeWrapper,
        phase1Rules,
        phase3Rules
        ){

  // list of symbols used
  const sym = {

      // the wrapper object for this node; contains alternative versions with different units
      wrap:  Symbol( 'wrap' ),

  };

  /**
   * analyze the given AST with respect to the given binding
   * and return the possibilities for resulting units
   */
  async function estimateUnit( ast, binding ){

    // get a list of involved units
    const involvedUnits = Object.keys(binding).map( function( key ){ return binding[key]; });

    // augment units with compounds
    const compoundUnits = await UnitStore.populateCompounds( involvedUnits )

     // populate details for all involved units
     const usedUnits = new Set();
     for( let i=0; i<compoundUnits.length; i++ ) {

       // add the unit itself
       usedUnits.add( compoundUnits[i] );

       // add all in numerator
       for( let j=0; j<compoundUnits[i]._compounds.num.length; j++ ) {
         usedUnits.add( compoundUnits[i]._compounds.num[j] );
       }

       // add all in denominator
       for( let j=0; j<compoundUnits[i]._compounds.denom.length; j++ ) {
         usedUnits.add( compoundUnits[i]._compounds.denom[j] );
       }

     }

     // populate them
     await UnitStore.populateUnits( usedUnits );

     // create equivalence classes for all scaled units
     const eqClasses = createEqClasses( usedUnits );

     // apply phase 1 rules on original AST
     const root = recWalkPhase1( ast );

     // phase2: determination of unit results
     const wrappedRoot = recWalk( ast, binding, eqClasses );

     // apply phase3 rules to all variants of the root
     const variants = wrappedRoot.getAll();
     for( let i=0; i<variants.length; i++ ) {
       variants[i] = recWalkPhase3( variants[i] )
     }

     // return serialized AST version
     return new estimateUnitResult( wrappedRoot );

  };


  /**
   * post order walk for phase 1 transformations
   */
  function recWalkPhase1( node ) {

    // if this is a leave ...
    if( !('children' in node) ){

      // do nothing and return node
      return node;

    }

    // process all children and replace own children list by new one
    var children = [];
    for( var i=0; i<node.children.length; i++ ) {
      var child = recWalkPhase1( node.children[i] );
      children.push( child );
    }
    node.children = children;

    // apply rules
    for( var i=0; i<phase1Rules.length; i++ ) {
      node = phase1Rules[i]( node );
    }

    // return this node
    return node;

  }


  /**
   * pre order walk for phase 3 transformations
   */
  function recWalkPhase3( node ) {

    // apply rules
    for( var i=0; i<phase3Rules.length; i++ ) {
      node = phase3Rules[i]( node );
    }

    // if this is a leaf ...
    if( !node.getWrapper().getChildCount() ){

      // ... return node
      node.countConv();
      return node;

    }

    if( node.isConv() ) {

      // converted node: process the conversion base
      var base = node.getConvBase();
      base = recWalkPhase3( base );
      node.setConvBase( base );

    } else {

      // non-converted node: process all children
      var oldChildren = node.getChildren( true ),
          newChildren = [];
      if( oldChildren ) {
        for( var i=0; i<oldChildren.length; i++ ) {

          var child = recWalkPhase3( oldChildren[i] );
          newChildren.push( child );

        }
        node.setChildren( newChildren );
      }

    }

    // recount of the conversions may be necessary
    node.countConv();

    // return this node
    return node;

  }



  /**
   * walk the tree and determine needed unit conversions
   */
  function recWalk( node, binding, eqClasses ) {

    // if this is a leave ...
    if( !('children' in node) ){

      // create and add a unit-augmented wrapper
      node[ sym.wrap ] = new NodeWrapper( node, [] );

      // get the source unit for this leave
      const sourceUnit = binding[ node.value ];

      // add a variant with the respective source unit
      node[ sym.wrap ].add( sourceUnit );

      // check, if it has an equivalence class
      const eqClass = eqClasses.get( sourceUnit );
      if( eqClass ) {
        eqClass.forEach( function( unit ){
          if( unit != sourceUnit ) {
            var variant = node[ sym.wrap ].add( unit );
            variant.isConv( true );
          }
        });
      }

      // done
      return node[ sym.wrap ];

    }

    // process children first
    const childWrappers = [];
    for( let i=0; i<node.children.length; i++ ) {
      const child = recWalk( node.children[i], binding, eqClasses );
      childWrappers.push( child );
    }

    // create a new wrapper for this node
    const wrapper = new NodeWrapper( node, childWrappers );

    // process the actual node's operation
    // assumption is, that for * and / there is always two operators
    switch( node.value ) {

      case '+':
      case '-':

        // we add a variant for each of the source units
        for( let i=0; i<childWrappers.length; i++ ) {

          // get variants
          const variants = childWrappers[ i ].getAll();

          // walk all variants
          for( let j=0; j<variants.length; j++ ) {

            // get the actual unit
            const unit = variants[j].getUnit();

            // try to add a variant
            if( unit ) {
              wrapper.add( unit );
            }

          }
        }

        break;

      // multiplication / division
      case '*':
      case '/':

        // get all base units
        const variants1 = childWrappers[ 0 ].getAll(),
              variants2 = childWrappers[ 1 ].getAll();

        // add all combinations
        for( let i=0; i<variants1.length; i++ ) {
          for( let j=0; j<variants2.length; j++ ) {

            // variants that are not compatible by their equivalence classes, should not be created
            if( !compatEqClasses( eqClasses, variants1[i], variants2[j] ) ) {
              continue;
            }

            // create resulting unit
            const unit = ( node.value == '*' )
                         ? VirtualUnit.mul( variants1[i].getUnit(), variants2[j].getUnit() )
                         : VirtualUnit.div( variants1[i].getUnit(), variants2[j].getUnit() );

            // if we got a result
            if( unit ) {

              // add to wrapper
              const variant = wrapper.add( unit );

              // set children
              variant.setChildren( [ variants1[i], variants2[j] ] );

              // update conversion count
              variant.countConv();

            }

          }
        }

        break;

    }

    return wrapper;

  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXX compatEqClasses() XXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * check, whether the two given variants are compatible wrt their used equivalence classes
   * == at most one unit per equivalence class is used (may be used multiple times, though)
   *
   * @returns {Boolean}
   */
  function compatEqClasses( eqClasses, v1, v2 ) {

    // short circuit: no equivalence classes given
    if( eqClasses.size < 1 ) {
      return true;
    }

    // collect for each found equivalence class the respective unit
    // return false for the first mismatch
    const foundEqUnits = new Map();

    // get the respective units
    const u1 = v1.getUnit(),
          u2 = v2.getUnit();

    // check all involved compound arrays
    return    checkCompArr( eqClasses, u1._compounds.num,   foundEqUnits )
           && checkCompArr( eqClasses, u1._compounds.denom, foundEqUnits )
           && checkCompArr( eqClasses, u2._compounds.num,   foundEqUnits )
           && checkCompArr( eqClasses, u2._compounds.denom, foundEqUnits );

  }

  /**
   * checks a particular array against the given equivalence classes and already found units
   */
  function checkCompArr( eqClasses, arr, foundEqUnits ) {
    for( var i=0; i<arr.length; i++ ) {

      // is the unit affected by an equivalence class anyways?
      if( eqClasses.has( arr[i] ) ) {

        // try to get the dominant unit for its equivalence class
        var eqClass = eqClasses.get( arr[i] ),
            eqUnit = foundEqUnits.get( eqClass );

        if( eqUnit ) {

          // there already is a dominant unit, so we check
          if( eqUnit != arr[i] ) {
            return false;
          }

        } else {

          // there was no dominant unit, so we register this one
          foundEqUnits.set( eqClass, arr[i] );

        }
      }
    }

    return true;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXX createEqClasses() XXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * sort all _scaled_ units into equivalence classes by their dimension
   */
  function createEqClasses( units ) {

    var res = new Map();
    for( var i=0; i<units.length; i++ ) {

      // skip non-scaled units
      if( !units[i].isScaled() ) {
        continue;
      }

      // compare to all existing keys
      var match = false;
      res.forEach( function( val, key, res ) {

        // we got a hit
        if( units[i].isCompatible( key ) ) {

          val.add( units[i] );
          res.set( units[i], val );
          match = true;

        }

      });

      // if no match, create a new equivalence class
      if( !match ) {
        var set = new Set();
        set.add( units[i] );
        res.set( units[i], set );
      }

    }

    return res;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX Result Object XXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * encapsulates the results of the estimateUnit process
   */
  function estimateUnitResult( wrapper ) {
    this._wrapper = wrapper;
    this._units   = null;
    this._inited  = false;
    this._unitmap = new Map();
  }

  /**
   * returns an array of object, which include the resulting unit
   * and the count of conversions leading to it
   */
  estimateUnitResult.prototype.getUnits = async function getUnits(){

    // return cached version, if available
    if( this._units ) {
      return this._units;
    }

    // add harmonized variants
    await this._wrapper.addHarmonizedVariants();

    // get all (harmonized) variants
    const variants = this._wrapper.getAll( false, true );

    // build result
    const res = variants.map( (v) => {
      return {
        unit: v.getUnit(),
        conv: v.getConvCount()
      };
    });

    // sort by number of conversions needed
    res.sort( (a,b) => a.conv - b.conv );

    // cache and return
    this._units = res;
    return res;

  }

  /**
   * return an AST for the result with the given unit
   */
  estimateUnitResult.prototype.getAst = async function getAst( unit ){

    // make sure the unit's compounds are initialized, before trying to work with it
    await UnitStore.populateCompounds( unit );

    if( this._unitmap.has( unit ) ) {

      // we have previously resolved to that unit, so map it back
      return this._wrapper.get( this._unitmap.get( unit ) ).toJSON();

    } else {

      // we don't have a map for this unit, so relay
      return this._wrapper.get( unit ).toJSON();

    }

  }

  /**
   * initialize the result object:
   * - (try to) resolve the resulting units
   */
  estimateUnitResult.prototype.resolve = async function resolve(){

    // just run once
    if( this._inited ) {
      return true;
    }

    // try to resolve all units (collecting requests here)
    const reqs = (await this.getUnits())
                      .map( async (entry) => {

                        // resolve the unit
                        const resolved = await UnitStore.resolveVirtualUnit( entry.unit )

                        // add entry for the resolved unit, if available
                        if( ('unit' in resolved) && (resolved.unit != entry.unit) ) {
                          this._unitmap.set( resolved.unit, entry.unit );
                        }

                        // return the resolved object
                        return Object.assign( {}, entry, resolved );

                      });

    // done
    this._inited = true;
    return Promise.all( reqs );

  }

  return estimateUnit;
});