"use strict";
/**
 * tries to convert between two unit-like objects
 * this is based on the compounds and not on the units itself
 *
 * assumption is, that there is a single base conversion unit per dimension,
 * that is the same for all units of that dimension
 *
 * strategy:
 * - fully decompose compounds
 * - replace all compounds with respective base unit of that dimension and collect factors
 * - cancel out common factors
 * - remaining factors can be combined to conversion
 *
 * minimum output format is OUT_AST
 */
define( [ 'basic/types/ArbNumber',
          'store/unit/estimateUnit/VirtualUnit',
          'comp/function/parseFormula',
          'comp/function/parseFormula/Constants',
          'comp/function/createFunction',
], function(
          ArbNumber,
          VirtualUnit,
          parseFormula,
          parseFormulaConst,
          createFunction
){

  // we need a one sometimes
  const one = ArbNumber( 1 );

  /**
   *
   * @param from    the unit to convert from
   * @param to      the unit to convert to
   * @param format  form of the output
   */
  async function convertVirtualUnits( from, to, format ){

    // make sure both units have their compounds attached
    await this.populateCompounds( [ from, to ] );

    // we will work on copies, so the original objects remain unchanged
    const fromComp = VirtualUnit.copy( from ),
          toComp   = VirtualUnit.copy( to );

    // shortcut to yavaa:one as it is a neutral element
    const unitOne = this.getUnit( 'http://yavaa.org/ns/units/one' );

    // remove common elements and neutral element yavaa:one
    cancelUnits( fromComp._compounds.num,   toComp._compounds.num,   unitOne );
    cancelUnits( fromComp._compounds.denom, toComp._compounds.denom, unitOne );

    // we may shortcircuit here under certain conditions
    const shortcircuitRes = await shortcircuit( fromComp, toComp, this, format, unitOne );
    if( shortcircuitRes ) {
      return shortcircuitRes;
    }

    // populate all compounds, so we can recognize scaled units
    const compounds = [ ... from._compounds.num, ... from._compounds.denom,
                        ... to  ._compounds.num, ... to  ._compounds.denom ];
    await this.populateUnits( compounds );

    // we can only convert in the following cases
    // * only a single scaled unit on each side and no other units
    // * only one scaled unit overall, so no conversion is necessary
    // all other cases result in an error
    const scaled = compounds.filter( (u) => u.isScaled() );
    if( scaled.length > 0 ) {



    }

    // prepare to replace all units by their respective base-units
    const uniqueUnits = [ ... fromComp._compounds.num, ... fromComp._compounds.denom,
                          ... toComp._compounds.num,   ... toComp._compounds.denom ],
          baseunits = await this.getBaseunit( uniqueUnits );

    // replace compounds with base units and collect factors
    const baseunitLookup = baseunits.reduce( (all, entry) => {
                                        all.set( entry.unit, entry );
                                        return all;
                                      }, new Map() );
    const fromFactors  = { num: [], denom: [] },
          toFactors    = { num: [], denom: [] };
    replaceBaseunits( fromComp._compounds,    fromFactors, baseunitLookup );
    replaceBaseunits( toComp._compounds,      toFactors,   baseunitLookup );

    // validate: after the replacement, all compounds should cancel out
    cancelUnits( fromComp._compounds.num,   toComp._compounds.num,   unitOne );
    cancelUnits( fromComp._compounds.denom, toComp._compounds.denom, unitOne );
    cancelUnits( fromComp._compounds.num,   fromComp._compounds.denom, unitOne );
    cancelUnits( toComp._compounds.num,     toComp._compounds.denom,   unitOne );
    if(    (fromComp._compounds.num.length != 0) || (fromComp._compounds.denom.length != 0)
        || (toComp._compounds.num.length != 0)   || (toComp._compounds.denom.length != 0) ) {
      throw new Error( 'Incompatible units!' );
    }

    // remove common elements step 1: within each unit
    cancelFactors( fromFactors.num, fromFactors.denom );
    cancelFactors( toFactors.num,   toFactors.denom );

    // remove common elements step 2: across both units
    cancelFactors( fromFactors.num,   toFactors.num );
    cancelFactors( fromFactors.denom, toFactors.denom );

    // collect everything and try to cancel out again
    const mulFactors = [ ... fromFactors.num,   ... toFactors.denom, from._compounds.prefixFactor ],
          divFactors = [ ... fromFactors.denom, ... toFactors.num,   to._compounds.prefixFactor ];
    cancelFactors( mulFactors, divFactors );

    // convert to requested format
    return toOutput( mulFactors, divFactors, format );

  }


  /**
   * check, whether we can shortcircuit at this point
   * - only single units left in numerators or denominators, so we can directly convert between those
   * - if one unit's compounds are empty, the remaining compound in the other unit should resolve to "amount" and we can try to convert from/to yavaa:one
   */
  async function shortcircuit( from, to, UnitStore, format, unitOne ) {

    // shortcuts
    const fromNum   = from._compounds.num,
          fromDenom = from._compounds.denom,
          toNum     = to._compounds.num,
          toDenom   = to._compounds.denom;
    let convAST;

    // don't do anything, if there are too many units present
    if( (fromNum.length > 1) || ((fromDenom.length > 1) || (toNum.length > 1)) || (toDenom.length > 1) ) {
      return null;
    }

    // only numerators left
    if( (fromDenom.length == 0) && (toDenom.length == 0) ) {

      // get conversion AST between both units
      convAST = await UnitStore.convertUnits( fromNum[0] || unitOne, toNum[0] || unitOne, parseFormulaConst.OUT_AST );

    }

    // only denominators left
    if( (fromNum.length == 0) && (toNum.length == 0) ) {

      // get conversion AST between both units
      convAST = await UnitStore.convertUnits( fromDenom[0] || unitOne, toDenom[0] || unitOne, parseFormulaConst.OUT_AST, true );

    }

    // if we got a conversion AST, include the factors of both units, if present
    if( convAST ) {

      if( from._compounds.prefixFactor.compare( one ) != 0 ) {
        convAST = {
            value: '*',
            children: [ convAST, { value: from._compounds.prefixFactor } ],
        };
      }

      if( to._compounds.prefixFactor.compare( one ) != 0 ) {
        convAST = {
            value: '/',
            children: [ convAST, { value: to._compounds.prefixFactor } ],
        };
      }

      // convert to requested output-format
      format = format || parseFormulaConst.OUT_AST;
      return parseFormula( parseFormulaConst.IN_AST, format, convAST );

    }

    // not able to short circuit
    return null;

  }


  /**
   * replace all units within compounds with their base units and collect the required factors
   * this will modify the parameter array!
   *
   * @params    {Object}              compounds     the compounds object ( { num: [], denom: [] } )
   * @params    {Object}              factors       factor object ( { num: [], denom: [] } )
   * @params    {Boolean}             isNum         compound array a numerator?
   * @params    {Object}              baseunits     a mapping from URI of Unit to the respective baseunit and factors
   */
  function replaceBaseunits( compounds, factors, baseunits ) {

    // new compounds
    const res = {
        num:    [],
        denom:  [],
    };

    // process numerator
    for( const unit of compounds.num ) {

      // not resolvable
      if( !baseunits.has( unit ) ) {
        res.num.push( unit );
        continue;
      }

      // get replacement and substitute
      const replacement = baseunits.get( unit );
      res.num.push(       ... replacement.base.num );
      res.denom.push(     ... replacement.base.denom );
      factors.num.push(   ... replacement.factors.num );
      factors.denom.push( ... replacement.factors.denom );

    }

    // process denominator
    for( const unit of compounds.denom ) {

      // not resolvable
      if( !baseunits.has( unit ) ) {
        res.num.push( unit );
        continue;
      }

      // get replacement and substitute
      const replacement = baseunits.get( unit );
      res.num.push(       ... replacement.base.denom );
      res.denom.push(     ... replacement.base.num );
      factors.num.push(   ... replacement.factors.denom );
      factors.denom.push( ... replacement.factors.num );

    }

    // replace compounds
    compounds.num = res.num;
    compounds.denom = res.denom;

  }


  /**
   * cancel out common elements from both given arrays - unit edition
   * works just on the currently given compounds and does no further decomposition
   * transforms the given arrays
   * also removes the neutral element as given by unitOne
   *
   * @param   {Array}   a
   * @param   {Array}   b
   * @param   {Unit}    unitOne     the neutral element
   */
  function cancelUnits( a, b, unitOne ){

    // remove neutral elements
    for( let i=0; i<a.length; i++ ) {
      if( a[i] == unitOne ) {
        a.splice( i, 1 );
      }
    }
    for( let i=0; i<b.length; i++ ) {
      if( b[i] == unitOne ) {
        b.splice( i, 1 );
      }
    }

    // sort the result again
    a.sort( (a,b) => a.getHash().localeCompare( b.getHash() ) );
    b.sort( (a,b) => a.getHash().localeCompare( b.getHash() ) );

    // remove common elements
    let indA = 0,
        indB = 0;
    while( (indA < a.length) && (indB < b.length) ){

      // same element in both arrays
      if( a[indA] == b[indB] ) {
        a.splice( indA, 1 );
        b.splice( indB, 1 );
        continue;
      }

      // increment the index for the "lower" value
      if( a[ indA ].getHash().localeCompare( b[ indB ].getHash() ) < 0 ) {
        indA += 1;
      } else {
        indB += 1;
      }

    }
  }


  /**
   * cancel out common elements from both given arrays - number edition
   * transforms the given arrays
   *
   * @param   {Array}   a
   * @param   {Array}   b
   */
  function cancelFactors( a, b ){

    // remove "one"s
    for( let i=0; i<a.length; i++ ) {
      if( a[i].compare( one ) == 0 ) {
        a.splice( i, 1 );
      }
    }
    for( let i=0; i<b.length; i++ ) {
      if( b[i].compare( one ) == 0 ) {
        b.splice( i, 1 );
      }
    }

    // make sure the lists are sorted, before we begin
    a.sort( (a,b) => a.compare( b ) );
    b.sort( (a,b) => a.compare( b ) );

    // cancel out
    let indA = 0,
        indB = 0;
    while( (indA < a.length) && (indB < b.length) ){

      // same element in both arrays
      if( a[indA].compare( b[indB] ) == 0 ) {
        a.splice( indA, 1 );
        b.splice( indB, 1 );
        continue;
      }

      // increment the index for the "lower" value
      if( a[ indA ].compare( b[ indB ] ) < 0 ) {
        indA += 1;
      } else {
        indB += 1;
      }

    }

  }


  /**
   * convert the final multiplication and/or division factors to the requested output format
   * factors will NOT be combined/pre-computed to allow for optimization of the whole formula
   *
   * @TODO the subtree could be better balanced; currently it is just a list of operations
   *
   * @params    {Array[ArbNumber]}    mulFactors        multiplication factors
   * @params    {Array[ArbNumber]}    divFactors        division factors
   * @params    {Number}              format            the requested format as constant from comp/function/parseFormula/Constants
   * @returns   {*}                                     the requested output
   */
  function toOutput( mulFactors, divFactors, format ){

    // start the AST with a value node
    let ast = { value: 'value' };

    // apply all multiplications
    for( let factor of mulFactors ) {
      ast = {
          value: '*',
          children: [ ast, { value: factor } ],
      };
    }

    // apply all divisions
    for( let factor of divFactors ) {
      ast = {
          value: '/',
          children: [ ast, { value: factor } ],
      };
    }

    // convert to requested output-format
    format = format || parseFormulaConst.OUT_AST;
    return parseFormula( parseFormulaConst.IN_AST, format, ast );

  }

  return convertVirtualUnits;

});