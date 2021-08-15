"use strict";
/**
 * suggest matching visualisations for a particular dataset
 */
define([
  'viz/RepoList',
  'basic/Constants',
  'util/weightedMatching',
  'util/requirePromise',
], function(
      RepoList,
      Constants,
      match,
      requireP
    ){

  /*
   * Repolist format is array of array (from server/init/store.viz):
   * 0 ... id of the viz
   * 1 ... id of the binding within a viz description
   * 2 ... number of columns for this binding
   * 3 ... boolean, whether there are bindings, that may take multiple columns
   * 4 ... boolean, whether this is a nesting layout
   * 5 ... boolean, whether this contains optional columns
   * 6 ... boolean, whether this contains array columns
   */
  const DESC = Object.freeze({
                  ID:           0,
                  BINDING:      1,
                  COLCOUNT:     2,
                  HASMULTIPLE:  3,
                  ISLAYOUT:     4,
                  HASOPTIONAL:  5,
                }),
        USESLAYOUT = Symbol.for( 'candidate using a layout' );


  /**
   * actual suggestion entry point
   * steps:
   * 1. filter RepoList for (techn.) matching visualizations
   * 2. grab the respective descriptions
   * 3. create an example binding for each (when possible)
   * 4. return list of possible bindings
   */
  async function suggestExact( ds ) {

    // make sure the distinct values for this datasets are calculated as we will need them multiple times
    ds.findDistinctValues();

    // get column descriptors
    // only consider dimensions with more than 1 value
    const columns = ds.getColumnMeta(),
          colOmitted = [], colDesc = [];
    for( const col of columns ) {

      // measurements are always included
      if( !col.isDimension() ) {
        colDesc.push( col );
        continue;
      }

      // dimensions only, if they have multiple values
      const values      = col.getDistinctValues(),
            dimIncluded = ('list' in values) ? (values.list.length > 1) : (values.min != values.max);
      if( dimIncluded ) {
        colDesc.push( col );
        continue;
      }

      // all the rest is excluded
      colOmitted.push( col );

    }

    // column count
    const colCount = colDesc.length;

    // split between visualizations and layouts
    const vizList = [],
          layoutList = [];
    for( let entry of RepoList ) {
      if( entry[ DESC.ISLAYOUT ] ) {
        layoutList.push( entry );
      } else {
        vizList.push( entry );
      }
    }

    // create candidates
    // single viz
    const candidates = vizList.filter( function( binding ){
      return (binding[ DESC.COLCOUNT ] == colCount)                                       // exact match
              || ((binding[ DESC.HASMULTIPLE ] || binding[ DESC.HASOPTIONAL ]) && (colCount > binding[ DESC.COLCOUNT ]));  // match using multi column bindings
    });
    // layout + viz
    for( const layout of layoutList ) {
      for( const viz of vizList ) {

        // adjust the column count
        const adjColcount = viz[ DESC.COLCOUNT ] + layout[ DESC.COLCOUNT ];

        if( (adjColcount == colCount)                                   // exact match
            || ((viz[ DESC.HASMULTIPLE ] || viz[ DESC.HASOPTIONAL ]) && (colCount > adjColcount) )   // match using multi/optional column bindings
          ){
          // cand object is the union of both
          const cand = [];
          for( let i=0; i<layout.length; i++ ) {
            cand.push( { layout: layout[i], nested: viz[i] } );
          }
          cand[ USESLAYOUT ] = true;
          candidates.push( cand );
        }
      }
    }

    // if we got nothing, return here
    if( candidates.length < 1 ) {
      return [];
    }

    // get a unique list of involved modules
    const uniqueModules = new Set();
    candidates.forEach( (c) =>{
                if( !c[ USESLAYOUT ] ) {
                  uniqueModules.add( c[ DESC.ID ] );
                } else {
                  uniqueModules.add( c[ DESC.ID ].layout );
                  uniqueModules.add( c[ DESC.ID ].nested );
                }
              });

    // load descriptions for involved modules
    const moduleNames   = [ ... uniqueModules ],
          modulePaths   = moduleNames.map( (module) => `viz/${module}.desc` ),
          moduleDescs   = await requireP( modulePaths ),
          moduleLookup  = moduleDescs.reduce( (all,el,i) => { all[ moduleNames[i] ] = el; return all; }, {} );

    // collect feasible bindings
    const feasBindings = [];

    // process all candidate visualizations
    for( const cand of candidates ) {

      // get (virtual) list of possible column bindings
      let colBinding, preview;
      if( !cand[ USESLAYOUT ] ) {
        // single viz

        const binding = moduleLookup[ cand[DESC.ID] ][ cand[DESC.BINDING] ];
        colBinding = binding[ 'columnBinding' ];
        preview    = binding[ 'preview' ];

      } else {
        // layout + viz

        const layoutBinding = moduleLookup[ cand[DESC.ID].layout ][ cand[DESC.BINDING].layout ];
        // remove the viz bindings, as they have already been taken care of
        colBinding = layoutBinding.columnBinding
                                  .filter( (col) => col.datatype != Constants.VIZDATATYPE.VISUALIZATION );

        const nestedBinding = moduleLookup[ cand[DESC.ID].nested ][ cand[DESC.BINDING].nested ];
        colBinding = colBinding.concat( nestedBinding.columnBinding );

        preview = [ layoutBinding.preview, nestedBinding.preview ];
      }

      // find possible binding from given columns to required data
      const match = findBinding( colDesc, colBinding );

      // if we could bind all columns, this is part of the result
      if( match ) {
        feasBindings.push({
          'id':         cand[ DESC.ID ],
          'bindingId':  cand[ DESC.BINDING ],
          'binding':    match,
          'preview':    preview,
        });
      }

    }

    // sort result; descending by score
    feasBindings.sort( (a,b) => a.binding.score - b.binding.score );

    // return feasible bindings
    return feasBindings;

  }



  /**
   * find a maximum matching between given columns and the viz bindings
   * @returns {Object}
   */
  function findBinding( cols, bindings ) {

    // score each column against each binding
    const scores = [],        // score matrix
          mapCols = [],       // map matrix entries to the columns
          mapBindings = [];   // map matrix entries to the bindings
    for( let i=0; i<cols.length; i++ ) {

      // prepare scores and map entries
      scores.push( [] );
      mapCols.push( cols[i] );

      for( let j=0; j<bindings.length; j++ ) {

        if( bindings[j].isarray ) {

          // columns with multiple possible bindings

          // add an entry for each column
          for( let k=0; k<cols.length; k++ ) {
            scores[i].push( scoreMatching( cols[i], bindings[j], k == 0 ) );
            mapBindings.push( bindings[j] );
          }

        } else {

          // columns with a single possible binding

          scores[i].push( scoreMatching( cols[i], bindings[j], true ) );
          mapBindings.push( bindings[j] );
        }

      }

    }

    // calculate total matching
    const matching = match( scores );

    // not all columns could be matched
    if( matching.length != cols.length ) {
      return null;
    }

    // convert matching back to binding
    const result = {};
    let totalScore = 0;
    for( let i=0; i<matching.length; i++ ) {

      // in some cases, the matching is just virtual or invalid
      if(    !( matching[i][0] in scores )                            // column does not exist
          || !( matching[i][1] in scores[ matching[i][0] ])           // binding does not exist
          || ( scores[ matching[i][0] ][ matching[i][1] ] <= 0 ) ) {  // binding has score zero
        return null;
      }

      // add to total score
      totalScore += scores[ matching[i][0] ][ matching[i][1] ];

      // get id of the binding
      const bId = mapBindings[ matching[i][1] ]['id'];

      // get column id
      const colId = mapCols[ matching[i][0] ].getID();

      // add to result
      if( !(bId in result) ) {
        // single value
        result[ bId ] = colId;
      } else if ( result[bId] instanceof Array ){
        // multi value
        result[ bId ].push( colId );
      } else {
        // convert to multi value
        result[ bId ] = [ result[bId], colId ];
      }

    }

    // each mandatory binding must be bound
    for( let bind of bindings ){
      if( !bind.optional && !(bind.id in result) ) {
        return null;
      }
    }

    // return result
    return {
      'binding': result,
      'score': totalScore
    };

  }


  /**
   * rate a specific column vs a possible binding
   * @returns   {Number}    the rating
   */
  function scoreMatching( col, bind, isPrimary ) {

    // initial score
    let score = 1;

    // dim / meas
    // has to be fitting
    if( col.isDimension() ) {

      if( bind['role'] != Constants.ROLE.DIM ) {
        return 0;
      }

    } else {

      if( bind['role'] != Constants.ROLE.MEAS ) {
        return 0;
      }

    }

    // data type
    // has to be fitting
    const dataType = col.getDatatype()
    switch( dataType ) {
      case Constants.DATATYPE.STRING:
      case Constants.DATATYPE.SEMANTIC:
        if( !(bind['datatype'] & Constants.VIZDATATYPE.CATEGORICAL) ) {
          return 0;
        }
        break;
      case Constants.DATATYPE.TIME:
        if( !(bind['datatype'] & Constants.VIZDATATYPE.TIME) ) {
          return 0;
        }
        break;
      case Constants.DATATYPE.NUMERIC:
        if( !(bind['datatype'] & Constants.VIZDATATYPE.QUANTITATIVE) ){
          return 0;
        }
        break;
    }

    // cardinality
    if( 'cardinality' in bind ) {

      // number of distinct values
      const distVals = col.getDistinctValues().list.length;

      // lower bound
      if( 'lower' in bind.cardinality ) {
        score = score * calcCardinalityScore( bind.cardinality.lower, distVals );
      }

      // upper bound
      if( 'upper' in bind.cardinality ) {
        score = score * (1 - calcCardinalityScore( bind.cardinality.upper, distVals ));
      }

    }

    // primary vs secondary nodes
    if( !isPrimary || bind['optional'] ) {
      score = score * 0.5;
    } else {
      if( score > 0 ) {
        score = score * 0.5 + 0.5;
      }
    }

    // we are done
    return score;

  }


  // export
  return suggestExact;

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Cardinality Functions XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * calculate the cardinality score wrt to lower boundary.
   * upper boundary can be calculated using (1 - lowerBoundary)
   */
  function calcCardinalityScore( param, value ) {

    switch( param['function'].toLowerCase() ){

      case 'heaviside': return value >= param.threshold ? 0 : 1;

      case 'linear':    const ret = 0.5 + (x- param.threshold) * (0.5 / param.variance);
                        return Math.max( 0, Math.min( 1, ret ) );

      case 'sigmoid':   if( value <= (param.threshold - param.variance) ){
                          return 0;
                        } else if ( value >= (param.threshold + param.variance ) ) {
                          return 1;
                        } else {
                          return 1 - (1 / (1 + Math.pow( Math.E, (5/param.variance)*( -x + param.threshold) )));
                        }

      default: throw new Error( 'Unknown cardinality scoring function' );
    }
  }

});