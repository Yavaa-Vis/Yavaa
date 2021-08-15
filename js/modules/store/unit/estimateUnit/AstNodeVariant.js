"use strict";
/**
 * encapsulates a unit-attached variant of an AstNodeWrapper
 *
 */
define( [ 'store/unit/estimateUnit/VirtualUnit',
          'store/unit',
          'comp/function/parseFormula/Constants',
], function(
          VirtualUnit,
          UnitStore,
          parseConstants
){

  /**
   * unit specific variant of a wrapped AST node
   * @param {AstNodeWrapper}    wrapper         pointer to the owning AstNodeWrapper
   * @param {Unit|VirtualUnit}  unit            unit like object to represent this variant
   * @param {Array[Variant]}    children        number of conversion needed to get to this variant
   * @param {Boolean}           isConverted     is this a variant, that is a conversion of the current node?
   */
  function Variant( wrapper, unit, isConverted ){

    // make sure "isConverted" is a boolean
    isConverted = !!isConverted;

    // store links
    this._wrapper  = wrapper;
    this._unit     = unit;
    this._conv     = 0;
    this._isConv   = isConverted;
    this._children = null;
    this._convBase = null;
    this._isHarmonized = false;

  }


  /**
   * compares the stored unit-like object of this variant against the given unit
   * @returns {Boolean}     true, if the unit and the the variant match
   */
  Variant.prototype.matchesUnit = function matchesUnit( unit ) {
    if( !unit ) {
      // asking for undefined unit
      return unit === this._unit;
    } else {
      // asking for defined unit
      return this._unit   // unit of this variant has to be defined
             && this._unit.hasEqualCompounds( unit ); // and has to be equal to the other one
    }
  }


  /**
   * count the conversions necessary for this variant
   */
  Variant.prototype.countConv = function countConv(){

    let conv = 0;
    if( this.isConv() ) {

      // get conversion base
      const base = this.getConvBase();

      // converted variant, so count is convBase + ?
      conv = base.getConvCount();

      // count the conversions necessary in this node:
      // by dividing we eliminate common entries for both
      // number of conversions necessary then has an upper bound
      // with half the number of remaining entries
      const comb = VirtualUnit.div( base.getUnit(), this.getUnit() );
      conv += (comb._compounds.num.length + comb._compounds.denom.length)/2;

    } else {

      // not converted variant, so count by children
      conv += this.getChildren()
                  .reduce( (all,el) => all + el.getConvCount(), 0 );

    }

    this._conv = conv;

  }

  /**
   * return the conversion base
   */
  Variant.prototype.getConvBase = function getConvBase(){

    // make sure there is a conversion base
    if( !this._convBase ) {

      // get the respective wrapper
      var wrapper = this.getWrapper();

      // get all unconverted variants
      var unconvVars = wrapper.getAll( true );

      // traverse all variants to see, which one fits best (in total)
      var convCount = Number.MAX_VALUE,
          convInd = -1,
          conv;
      for( var i=0; i<unconvVars.length; i++ ) {

        // shortcut for base
        var base = unconvVars[i];

        // compute the conv necessary, if this was the base node
        // by dividing we eliminate common entries for both
        // number of conversions necessary then has an upper bound
        // with half the number of remaining entries
        var comb = VirtualUnit.div( base.getUnit(), this.getUnit() );
        conv = (comb._compounds.num.length + comb._compounds.denom.length)/2;

        // skip those, that have at least two units to convert, of which one is scaled
        if( comb.isScaled() && (conv > 1)){
          continue;
        }

        // add the conversions necessary to get to the base
        conv += base.getConvCount();

        // is this better?
        if( conv < convCount ) {
          convCount = conv;
          convInd = i;
        }
      }

      // choose the best variant as conversion base
      this._convBase = unconvVars[ convInd ];

    }

    return this._convBase;
  }


  /**
   * set the conversion base for this node
   */
  Variant.prototype.setConvBase = function setConvBase( base ){
    this._convBase = base;
  }


  /**
   * get the children for this variant:
   * (only applicable, if the wrapper node is addition/subtraction)
   *
   * either it already has a children list,
   * get from one unconverted variant
   * or we extract the children from the wrapper
   */
  Variant.prototype.getChildren = function getChildren(){

    // children are defined at this object
    if( this._children ) {
      return this._children;
    }

    // get directly from wrapper
    const children = [],
          childWrappers = this._wrapper.getChildren();
    for( var i=0; i<childWrappers.length; i++ ) {

      // get a variant of the child node with the current unit
      const child = childWrappers[i].get( this._unit );

      // add to children array
      children.push( child );

    }

    // remember the children
    return children;
  }



  /**
   * converts the structure into a serializable AST form
   */
  Variant.prototype.toJSON = async function toJSON(){

    // determine, if this variant is to be treated as converted
    // variants without units are treated as uncoverted
    let base,
        isConverted = this.isConv();
    if( isConverted ) {

      // get the conversion base
      base = this.getConvBase();

      // check, whether base has a unit
      isConverted = isConverted && base.getUnit();

    }

    // if this node is converted and the source actually had a unit
    if( isConverted ) {

      // for converted nodes, ...

      // serialize conversion base
      // and convert between units
      const [convAST, serBase ] = await Promise.all( [ UnitStore.convertVirtualUnits( base.getUnit(), this.getUnit(), parseConstants.OUT_AST ),
                                                       base.toJSON() ] )

      // no conversion needed, skip
      if( !convAST ) {
        return serBase;
      }

      // find the value node and its parent in the conversion AST
      const valueNode = findValueNode( convAST ),
            parent    = valueNode.parent;

      // replace the value node with the serialized conversion base
      const ind = parent.children.indexOf( valueNode );
      parent.children.splice( ind, 1, serBase )

      // return the AST
      return convAST;

    } else {

      // for unconverted nodes, ...

      // serialize this node
      const res = {
//        _debug:  this._conv + ' - ' + JSON.stringify( this._unit ),
        value:   this.getValue(),
        type:    this.getType(),
        children: []
      };

      // get the children of this variant
      const children = this.getChildren();

      // serialize all children
      const reqs = [];
      for( let i=0; i<children.length; i++ ) {

        // serialize
        reqs.push( (async function( ind ){
          res.children[ ind ] = await children[ ind ].toJSON();
        })( i ));

      }

      // return, when all are finished
      await Promise.all( reqs );
      return res;

    }

  }


  /**
   * return the unit for this variant
   */
  Variant.prototype.getUnit = function getUnit(){
    return this._unit;
  }


  /**
   * return the node value, this variant belongs to
   */
  Variant.prototype.getValue = function getValue(){
    return this._wrapper._wrapped.value;
  }

  /**
   * return the node value, this variant belongs to
   */
  Variant.prototype.getType = function getType(){
    return this._wrapper._wrapped.type;
  }

  /**
   * is this variant converted?
   */
  Variant.prototype.isConv = function isConv( newVal ){

    // are we ordered to set a new value?
    if( typeof newVal !== 'undefined' ) {

      // make sure it is a boolean
      newVal = !!newVal;

      // if the value changes, we have to correct the conversion count
      if( newVal !== this._isConv ) {
        this._conv += newVal ? 1 : -1;
      }

      // set new value
      this._isConv = newVal;
    }

    // return value
    return this._isConv;
  }


  /**
   * is this variant harmonized?
   * contains only one unit per dimension
   */
  Variant.prototype.isHarmonized = function isHarmonized( newVal ){

    // are we ordered to set a new value?
    if( typeof newVal !== 'undefined' ) {

      // set new value
      this._isHarmonized = newVal;

    }

    // return value
    return this._isHarmonized;

  }


  /**
   * get the AstNodeWrapper associated to this variant
   */
  Variant.prototype.getWrapper = function getWrapper(){
    return this._wrapper;
  }

  /**
   * set the children array for this variant
   */
  Variant.prototype.setChildren = function setChildren( children ) {
    this._children = children;
  }


  /**
   * return the count of children for this variant
   */
  Variant.prototype.getChildCount = function getChildCount(){
    if( this._children ) {
      return this._children.length;
    } else {
      return null;
    }
  }

  /**
   * return the number of conversions needed to get to this variant
   * @returns {Number}
   */
  Variant.prototype.getConvCount = function getConvCount(){
    return this._conv;
  }

  /**
   * toString methods
   */
  const Util = require( 'util' );
  Variant.prototype[ Util.inspect.custom ] = function inspect(){
    return `[Object Variant: ${this.getUnit().getLabel()}]`;
  }

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXX Helper Functions XXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * search recursively through an AST and return a pointer to the node containing "value"
   */
  function findValueNode( ast ) {
    if( ast.value == 'value' ) {
      return ast;
    } else {
      for( let i=0; i<ast.children.length; i++ ) {
        const res = findValueNode( ast.children[i] );
        if( res ) {
          return res;
        }
      }
    }
  }


 return Variant;
});