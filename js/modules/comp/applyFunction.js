define( [ 'store/data',
          'util/requirePromise',
          'basic/Constants',
          'comp/function/parseFormula/Constants'  ],
function( DataStore,
          requireP,
          Constants,
          parseConstants
){
  "use strict";

  /**
   * apply the function given with funktion on column col_id in dataset data_id
   * @param {Number}   data_id      identifier of the dataset
   * @param {Number}   col_id       identifier of the column
   * @param {String}   fktDef       funktion to apply including additional information
   * @param {String}   fktType      type of the given function
   * @param {Boolean}  isNewCol     should the results be stored in a new column?
   * @param {String}   [newLabel]   optional label for the new column
   */
  return async function applyFunction( data_id, col_id, fktDef, fktType, isNewCol, newLabel ) {

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX PREPARATION XXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // parse input to an AST
    const [ parseFormula, parseConstants ] = await requireP( [ 'comp/function/parseFormula', 'comp/function/parseFormula/Constants' ] );
    let ast;
    switch( fktType.toUpperCase() ) {

      // user defined function
      case 'UDF':   ast = await parseFormula( null, parseConstants.OUT_AST_LABELED, fktDef );
                    break;

      // given as AST (internal functions)
      case 'AST':   ast = fktDef;
                    break;

      // unknowns
      default: throw new Error( 'Unknown operation type: ' + fktType );

    }

    // get involved variables
    const values = getVariablesFromAst( ast );

    // map variables to columns
    const colMap = values.reduce( (all, el) => {
                            if( el == 'value' ) {
                              all[ el ] = parseInt( col_id, 10 );
                            } else {
                              all[ el ] = parseInt( el.replace( /[^0-9]/gi, '' ), 10 );
                            }
                            return all;
                          }, {} );

    // get reference to datasets metadata
    const colMeta = DataStore.getDataset( data_id )
                             .getColumnMeta();

    // make sure all columns are numeric
    const colIndices = Object.values( colMap );
    for( let i=0; i<colIndices.length; i++ ) {

      // column has to exist (IndexOutOfBounds)
      if( !colMeta[ colIndices[i] ] ) {
        throw new Error( 'Column does not exist: ' + colIndices[i] );
      }

      // check for non-numeric columns
      if( colMeta[ colIndices[i] ].getDatatype() != Constants.DATATYPE.NUMERIC ) {
        throw new Error( 'Non numeric column: ' + colIndices[i] );
      }

    }

    // check unit consistency
    // if there are no values, we have a constants-formula
    // in these cases asssign no units
    let allUnitsSet = true;
    const unitMap = values.reduce( (all, el) => {
                            all[ el ] = colMeta[ colMap[el] ].getUnit();
                            allUnitsSet &= !!all[el];
                            return all;
                          }, {} );
    let newUnit;
    if( allUnitsSet && (values.length > 0)) {

      // estimate unit
      const estimateUnit = await requireP( 'store/unit/estimateUnit' ),
            unitResult = await estimateUnit( ast, unitMap );

      // use the best hit
      newUnit = (await unitResult.getUnits())[0].unit;

      // replace the ast
      ast = await unitResult.getAst( newUnit );

      // label it again
      ast = await parseFormula( parseConstants.IN_AST, parseConstants.OUT_AST_LABELED, ast );

    }

    /* XXXXXXXXXXXXXXXXXXXXXXXXXXXX APPLICATION XXXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // parse AST to function data
    const fktData = await parseFormula( parseConstants.IN_AST_LABELED, null, ast );

    // function data to applicable function
    const createFunktion = await requireP( 'comp/function/createFunction' ),
          funktion = createFunktion( fktData );

    // apply function
    const executeFunction = await requireP( 'comp/executeFunction' ),
          newCol = await executeFunction( data_id, col_id, values, funktion );

    /* XXXXXXXXXXXXXXXXXXXXXX MAINTENANCE of METADATA XXXXXXXXXXXXXXXXXXXXXX */

    // get column meta of source column
    // either selected column or the first numeric column used
    const oldColMeta = colMeta[ (col_id >= 0) ? col_id : colIndices[0] ];

    // create a new column meta object and set values accordingly
    const newColMeta = oldColMeta.clone( null, true );
    newColMeta.setUnit( newUnit );
    newColMeta.setConcept( null );

    // if it is a new column, we have to change some stuff
    if( isNewCol ) {
      newColMeta.setLabel( newLabel || 'Derived Column' );
    } else {
      newColMeta.setSource( oldColMeta );
    }

    /* XXXXXXXXXXXXXXXXXXXXXXX PERSIST IN DATASTORE XXXXXXXXXXXXXXXXXXXXXXXX */

    // create new dataset
    const newDataId = await DataStore.deriveDatasetByColumn( data_id,
                                            isNewCol ? -2 : col_id,
                                            newCol,
                                            newColMeta
                                          );

    /* XXXXXXXXXXXXXXXXXXXXXXXXXX WORKFLOW HINTS XXXXXXXXXXXXXXXXXXXXXXXXXXX */

    // prepare workflow hints
    const wfHints = {
        'columns': []
    };
    wfHints['columns'][ newColMeta.getPosition() ] = {
        'former':  isNewCol ? null : col_id,
        'basedOn': Object.values( colMap ),
    };
    if( isNewCol ) {
      wfHints['columns'][ newColMeta.getPosition() ]['label'] = newColMeta.getLabel();
    }

    // done
    return {
      wfHints,
      dsId:     newDataId,
      col:      newColMeta,
    };
  };


  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX HELPER XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  /**
   * scan the given AST for entries of type variable
   * returns an array of variables present; duplicates may occur!
   */
  function getVariablesFromAst( ast ) {

    let result = [];

    // append result for current node
    if( ast.type == parseConstants.TOKEN_VARIABLE ){
      result.push( ast.value );
     }

    // append results for children
    if( ast.children ) {
      const childResults = ast.children.map( (node) => { return getVariablesFromAst( node ) } );
      result = result.concat( ... childResults );
    }

    return result;

  }


});