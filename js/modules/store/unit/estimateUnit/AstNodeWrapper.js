"use strict";
/**
 * provides a wrapper object around AST nodes
 * can handle unit related queries to a node
 *
 */
define([
         'store/unit',
         'store/unit/estimateUnit/AstNodeVariant',
         'store/unit/estimateUnit/VirtualUnit',
         'basic/types/ArbNumber' ],
function(
          UnitStore,
          Variant,
          VirtualUnit,
          ArbNumber ){

  function AstNodeWrapper( astNode, childWrapper ){

    // save link to related original AST node
    this._wrapped = astNode;

    // link to the wrapper of the respective child-nodes, if any
    this._children = childWrapper || [];

    // list of unit-variants for this node
    this._variants = [];

  };


  /**
   * add a new variant to this wrapper node
   * @param {Unit|VirtualUnit}    unit      the new unit of this variant
   * @param {Array[Variant]}      children  the variants of the children used for this new variant
   */
  AstNodeWrapper.prototype.add = function add( unit ) {

    // create new variant
    const variant = new Variant( this, unit );

    // do we have such a variant already?
    for( let i=0; i<this._variants.length; i++ ) {
      if( (!unit && !this._variants.getUnit() ) // both are undefined
          || ( unit && this._variants[i].getUnit()
               && (this._variants[i].getUnit().getHash() == unit.getHash()) )  // both defined
        ) {

        // which one used less conversions?
        if( this._variants[i]._conv <= variant._conv ) {

          // existing one is better, so do nothing

        } else {

          // new one is better, so replace
          this._variants.splice( i, 1, variant );

        }
        return this._variants[i];

      }
    }

    // no matches found, so add
    this._variants.push( variant );

    // sort variants by conversions needed to get to them; less conversions to the front
    this._variants.sort( function( a,b ){
      a._conv - b._conv;
    });

    return variant;
  }


  /**
   * for each variant add all harmonized variants, if necessary
   * a harmonized variant is one that does not have multiple units for the same dimension
   *   in its decomposed state (e.g. metre * foot )
   */
  AstNodeWrapper.prototype.addHarmonizedVariants = async function addHarmonizedVariants(){

    for( const variant of this._variants ) {

      // get the current unit
      const unit = variant.getUnit();

      // only applicable to VirtualUnits (others have been resolved to a single one already)
      if( !(unit instanceof VirtualUnit) ) {
        variant.isHarmonized( true );
        continue;
      }

      // make sure all compounds are populated
      const compounds = [ ... unit._compounds.num, ... unit._compounds.denom ];
      await UnitStore.populateUnits( compounds );

      // collect all used units; collect per dimension vector
      const unitsByDim = {};
      for( const part of unit._compounds.num ) {

        // get dim vector; as string so we can put it in the map
        const vector = part.getDimVector().toString();

        // add to map
        unitsByDim[ vector ] = unitsByDim[ vector ] || new Set();
        unitsByDim[ vector ].add( part );

      }
      for( const part of unit._compounds.denom ) {

        // get dim vector; as string so we can put it in the map
        const vector = part.getDimVector().toString();

        // add to map
        unitsByDim[ vector ] = unitsByDim[ vector ] || new Set();
        unitsByDim[ vector ].add( part );

      }

      // list of units, that "duplicate" each other within a dimension
      const unitSets = Object.values( unitsByDim )
                             .filter( (s) => (s.size > 1) )
                             .map( (s) => [ ... s ] );

      // if there are no duplicates, we can end here
      if( unitSets.length < 1 ) {

        // unit needs at least component
        if( Object.keys( unitsByDim ).length > 0 ) {
          variant.isHarmonized( true );
        } else {

        }
        continue;

      }

      // add a variant for each combination, where there is only one unit per dimension
      for( const mapping of getPermutationMap( unitSets ) ) {

        // create a virtual unit with harmonized units
        let variantUnit = new VirtualUnit({
                                num:          unit._compounds.num.map(   (u) => mapping.has( u ) ? mapping.get( u ) : u ),
                                denom:        unit._compounds.denom.map( (u) => mapping.has( u ) ? mapping.get( u ) : u ),
                                prefixFactor: ArbNumber( 1 ),
                              }, false );

        // if the new variant has no more components left, replace with "one"
        if(    (variantUnit._compounds.num.length == 0)
            && (variantUnit._compounds.denom.length == 0) ) {
          variantUnit = UnitStore.getUnit( 'http://yavaa.org/ns/units/one' );
        }

        // add new variant
        const newVariant = this.add( variantUnit );

        // set properties
        newVariant.setConvBase( variant );
        newVariant.isConv( true );
        newVariant.isHarmonized( true );

      }

    }

    return this;

  }

  /**
   * helper function to create the unit mapping needed in AstNodeWrapper.prototype.addHarmonizedVariants
   */
  function* getPermutationMap( base ) {

    // init counter
    const counter = Array( base.length ).fill( 0 );

    // indicator, if more combinations are possible
    let hasMore = true;

    // create permutations
    do {

      // create map for current counter
      const result = new Map();
      base.forEach( (list, listInd) => {

        // currently selected unit for this dimension
        const selUnit = list[ counter[ listInd ] ];

        // all other go to the mapping
        list.forEach( (unit) => {
          if( unit != selUnit ) {
            result.set( unit, selUnit );
          }
        });

      });

      // return permutation
      yield result;

      // increment counter
      counter[ 0 ] += 1;
      for( let i=0; hasMore && (counter[i] >= base[i].length); i++ ) {
        counter[i] = 0;
        if( i+1 < base.length ) {
          counter[i+1] += 1;
        } else {
          hasMore = false;
        }

      }

    } while( hasMore );

  }


  /**
   * returns a variant of this node with the requested compound structure
   * @param comp
   */
  AstNodeWrapper.prototype.get = function get( unit ) {

    // do we have a match already?
    let variant = this._variants.find( (v) => v.matchesUnit( unit ) );
    if( variant ) {
      return variant;
    }


    // we have to create a new variant
    variant = this.add( unit );
    variant.isConv( true );
    return variant;

  }

  /**
   * returns a complete list of all currently known variants of this wrapper
   * @param {Boolean}   limitToUnconv   return just the list of unconverted variants
   * @param {Boolean}   limitToHarm     return just the list of harmonized variants
   */
  AstNodeWrapper.prototype.getAll = function getAll( limitToUnconv, limitToHarm ){

    let res = limitToUnconv
                ? this._variants.filter( ( v ) => !v.isConv() )
                : this._variants.slice( 0 );

    if( limitToHarm ) {
      res = res.filter( (v) => v.isHarmonized() );
    }

    return res;
  }


  /**
   * get a list of all connected child wrappers
   */
  AstNodeWrapper.prototype.getChildren = function getChildren(){
    return this._children.slice( 0 );
  }


  /**
   * converts the structure into a serializable AST form
   */
  AstNodeWrapper.prototype.toJSON = function toJSON(){

    // create a root node
    var root = {
        value:    '=',
        children: []
    };

    // add all variants as children
    for( var i=0; i<this._variants.length; i++ ) {
      root.children.push( this._variants[i].toJSON() );
    }

    return root;
  }


  /**
   * get the value associated with this node
   */
  AstNodeWrapper.prototype.getValue = function getValue(){
    return this._wrapped.value;
  }

  /**
   * get the amount of children associated with this node
   */
  AstNodeWrapper.prototype.getChildCount = function getChildCount(){
    return this._children.length;
  }


  /**
   * set the children associated with this node
   */
  AstNodeWrapper.prototype.setChildren = function setChildren( children ){
    this._children = children;
  }

  return AstNodeWrapper;
});